import { ROLE } from "../enums/role.enum";
import { CreateRequestBodyUser } from "../dtos/user/createRequestBody";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { User } from "../models";
import { UpdateRequestBodyUser } from "../dtos/user/updateRequestBody";
import { hashPassword } from "../helpers/password.helper";

const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'];

export class UserService {

    async getAll(uow: UnitOfWork, page: number, limit: number) {
        const { count, rows: users } = await uow.users.findAllWithPagination(page, limit);
        return { count, users };
    }

    async getById(uow: UnitOfWork, id: string) {
        const user = await uow.users.findByIdWithAddresses(id, ATTRIBUTES_TO_EXCLUDE);
        return user;
    }

    async update(uow: UnitOfWork, id: string, data: UpdateRequestBodyUser) {
        const existingUser : User | null = await uow.users.findById(id);
        if (!existingUser) return null;
        const [affectedCount] = await uow.users.update(id, {
            ...existingUser,
            ...data,
        });

        if (affectedCount === 0) return null;

        return await uow.users.findById(id, {
            attributes: { exclude: ATTRIBUTES_TO_EXCLUDE }
        });
    }

    async deleteOne(uow: UnitOfWork, id: string) {
        const user = await uow.users.findById(id);
        if (!user) return "NOT_FOUND";

        if ([ROLE.ADMIN, ROLE.SUPERADMIN].includes(user.role as ROLE)) {
            return "FORBIDDEN";
        }

        await uow.users.softDelete(id);

        const addresses = await uow.userAddresses.findByUserId(id);
        if (addresses.length > 0) {
            const addressIds = addresses.map(addr => addr.address_id);
            await uow.userAddresses.bulkDelete(addressIds);
        }

        return "SUCCESS";
    }

   async create(uow: UnitOfWork, payload: CreateRequestBodyUser) {
        // ✅ Validate input
        if (!payload.email || !payload.password || !payload.first_name || 
            !payload.last_name || !payload.address || !payload.phone_number || 
            !payload.dob || !payload.gender || !payload.membership_id) {
            throw { status: 400, message: "Missing required fields" };
        }

        // ✅ Kiểm tra email đã tồn tại
        const existingUser = await uow.users.findByEmail(payload.email);
        if (existingUser) {
            throw { status: 400, message: "Email already exists" };
        }

        await uow.start(); // ✅ Bắt đầu transaction

        try {
            // ✅ Destructure và chuẩn bị dữ liệu
            const { dob, address, password, gender, ...userData } = payload;

            // ✅ Hash password
            const hashedPassword = await hashPassword(password);

            // ✅ Chuẩn bị user data
            const newUser: Partial<User> = {
                ...userData,
                password: hashedPassword,
                role: ROLE.USER,
                dob: new Date(dob), // ✅ Convert string to Date
                gender: gender.toUpperCase(), // ✅ Chuẩn hóa gender
                is_deleted: false,
                membership_id: userData.membership_id
            };

            console.log("Creating user with data:", newUser);

            // ✅ Tạo user
            const createdUser = await uow.users.create(newUser);

            console.log("User created with ID:", createdUser.id);

            // ✅ Tạo address
            await uow.userAddresses.create({
                user_id: createdUser.id,
                full_address: address,
                is_default: true,
                label: "Home",
                is_deleted: false,
            });

            console.log("Address created successfully");

            await uow.commit(); // ✅ Commit transaction

            // ✅ Lấy user với addresses (exclude sensitive fields)
            const result = await uow.users.findByIdWithAddresses(
                createdUser.id,
                ATTRIBUTES_TO_EXCLUDE
            );

            return result;

        } catch (error) {
            await uow.rollback(); // ✅ Rollback nếu có lỗi
            console.error("Error creating user:", error);
            
            if (error instanceof Error) {
                throw { status: 400, message: error.message, details: error };
            }
            throw error;
        }
    }
}
