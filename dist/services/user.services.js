"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const role_enum_1 = require("../enums/role.enum");
const password_helper_1 = require("../helpers/password.helper");
const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'];
class UserService {
    async getAll(uow, page, limit) {
        const { count, rows: users } = await uow.users.findAllWithPagination(page, limit);
        return { count, users };
    }
    async getById(uow, id) {
        const user = await uow.users.findByIdWithAddresses(id, ATTRIBUTES_TO_EXCLUDE);
        return user;
    }
    async update(uow, id, data) {
        const existingUser = await uow.users.findById(id);
        if (!existingUser)
            return null;
        const [affectedCount] = await uow.users.update(id, {
            ...existingUser,
            ...data,
        });
        if (affectedCount === 0)
            return null;
        return await uow.users.findById(id, {
            attributes: { exclude: ATTRIBUTES_TO_EXCLUDE }
        });
    }
    async deleteOne(uow, id) {
        const user = await uow.users.findById(id);
        if (!user)
            return "NOT_FOUND";
        if ([role_enum_1.ROLE.ADMIN, role_enum_1.ROLE.SUPERADMIN].includes(user.role)) {
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
    async create(uow, payload) {
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
        try {
            // ✅ Destructure và chuẩn bị dữ liệu
            const { dob, address, password, gender, ...userData } = payload;
            // ✅ Hash password
            const hashedPassword = await (0, password_helper_1.hashPassword)(password);
            // ✅ Chuẩn bị user data
            const newUser = {
                ...userData,
                password: hashedPassword,
                role: role_enum_1.ROLE.USER,
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
            // ✅ Lấy user với addresses (exclude sensitive fields)
            const result = await uow.users.findByIdWithAddresses(createdUser.id, ATTRIBUTES_TO_EXCLUDE);
            return result;
        }
        catch (error) {
            console.error("Error creating user:", error);
            if (error instanceof Error) {
                throw { status: 400, message: error.message, details: error };
            }
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.services.js.map