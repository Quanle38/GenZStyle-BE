import { Request, Response } from "express";
import handleError from "../helpers/handleError.helper";
import parseId from "../helpers/checkId";
import { ROLE } from "../enums/role.enum";
import { RequestCreateUser } from "../dtos/user.dto";
import { User } from "../models";
import { UserResponseDTO } from "../dtos/auth/response/user.response";
import { UnitOfWork } from "../unit-of-work/unitOfWork";

const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'];

const userController = {
    /**
     * GET /users - Lấy danh sách users với phân trang
     */
    getAll: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        
        try {
            const page = Number(req.query.page) || 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;

            const { count, rows: users } = await uow.users.findAllWithPagination(page, limit);
            
            const totalPage = Math.ceil(count / limit);
            
            return res.status(200).json({
                currentPage: page,
                totalPage,
                totalUser: count,
                data: users,
            });
        } catch (error: any) {
            return handleError(res, 500, error);
        }
    },

    /**
     * GET /users/:id - Lấy thông tin user theo ID kèm addresses
     */
    getById: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        
        try {
            const idParam = req.params.id;
            if (!idParam) {
                return handleError(res, 404, "User not found");
            }

            const id = parseId(idParam);

            const existingUser = await uow.users.findByIdWithAddresses(
                id, 
                ATTRIBUTES_TO_EXCLUDE
            );

            if (!existingUser) {
                return handleError(res, 404, "User not found");
            }

            return res.status(200).json({
                data: existingUser.toJSON() as UserResponseDTO,
            });
        } catch (error: any) {
            return handleError(res, 500, error);
        }
    },

    /**
     * PUT /users/:id - Cập nhật thông tin user
     */
    update: async (req: Request<{ id: string }, {}, Partial<User>>, res: Response) => {
        const uow = new UnitOfWork();
        
        try {
            await uow.start();

            const idParam = req.params.id;
            if (!idParam) {
                await uow.rollback();
                return handleError(res, 404, "User not found");
            }

            const id = parseId(idParam);
            const body = req.body;

            const existingUser = await uow.users.findById(id);
            if (!existingUser) {
                await uow.rollback();
                return handleError(res, 404, "User not found");
            }

            if (Object.keys(body).length === 0) {
                await uow.rollback();
                return handleError(res, 400, "No fields to update");
            }

            const [affectedCount] = await uow.users.update(id, {
                ...body,
                updated_at: new Date()
            });

            if (affectedCount === 0) {
                await uow.rollback();
                return handleError(res, 400, "Update failed");
            }

            const updatedUser = await uow.users.findByIdWithAddresses(
                id,
                ATTRIBUTES_TO_EXCLUDE
            );

            await uow.commit();

            return res.status(200).json({
                success: true,
                data: updatedUser,
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },

    /**
     * DELETE /users/:id - Xóa mềm user
     */
    deleteOne: async (req: Request<{ id: string }>, res: Response) => {
        const uow = new UnitOfWork();
        
        try {
            await uow.start();

            const idParam = req.params.id;
            if (!idParam) {
                await uow.rollback();
                return handleError(res, 404, "User not found");
            }

            const id = parseId(idParam);

            const user = await uow.users.findById(id);
            if (!user) {
                await uow.rollback();
                return handleError(res, 404, "User not found");
            }

            if (user.role === ROLE.ADMIN || user.role === ROLE.SUPERADMIN) {
                await uow.rollback();
                return handleError(res, 403, "YOU DON'T HAVE PERMISSION");
            }

            await uow.users.softDelete(id);

            const addresses = await uow.userAddresses.findByUserId(id);
            if (addresses.length > 0) {
                const addressIds = addresses.map(addr => addr.address_id);
                await uow.userAddresses.bulkDelete(addressIds);
            }

            await uow.commit();

            return res.status(204).send();
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },

    /**
     * POST /users - Tạo user mới
     */
    create: async (req: Request, res: Response) => {
        const uow = new UnitOfWork();
        
        try {
            await uow.start();
            const user: RequestCreateUser = req.body;

            if (!user.first_name || !user.email || !user.password || 
                !user.address || !user.dob || !user.phone_number || !user.gender) {
                await uow.rollback();
                return handleError(res, 400, "Missing required fields");
            }
            const existingUser = await uow.users.findByEmail(user.email);
            if (existingUser) {
                await uow.rollback();
                return handleError(res, 400, "Email already exists");
            }

            const { dob, address, ...userNew } = user;
            const newUserData: Partial<User> = {
                ...userNew,
                role: ROLE.USER,
                dob: new Date(dob),
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const createdUser = await uow.users.create(newUserData);

            const newAddressData = {
                user_id: createdUser.id,
                full_address: address,
                is_default: true,
                label: "Home",
                is_deleted: false,
                created_at: new Date(),
                updated_at: new Date(),
            };

            await uow.userAddresses.create(newAddressData);

            const userWithAddresses = await uow.users.findByIdWithAddresses(
                createdUser.id,
                ATTRIBUTES_TO_EXCLUDE
            );

            await uow.commit();

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: userWithAddresses,
            });
        } catch (error: any) {
            await uow.rollback();
            return handleError(res, 500, error);
        }
    },
};

export default userController;