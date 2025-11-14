import { ROLE } from "../enums/role.enum";
import { CreateRequestBodyUser } from "../dtos/user/createRequestBody";
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { User } from "../models";
import { UpdateRequestBodyUser } from "../dtos/user/updateRequestBody";

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
        const { dob, address, ...userData } = payload;

        const newUser: Partial<User> = {
            ...userData,
            role: ROLE.USER,
            dob: dob,
            is_deleted: false,
        };

        const createdUser = await uow.users.create(newUser);

        await uow.userAddresses.create({
            user_id: createdUser.id,
            full_address: address,
            is_default: true,
            label: "Home",
            is_deleted: false,
        });

        const result = await uow.users.findByIdWithAddresses(
            createdUser.id,
            ATTRIBUTES_TO_EXCLUDE
        );

        return result;
    }
}
