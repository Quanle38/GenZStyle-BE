// src/services/auth.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { LoginRequestBody } from "../dtos/auth/request/login.request";
import { RegisterRequestBody } from "../dtos/auth/request/register.request";
import { hashPassword, verifyPassword } from "../helpers/password.helper";
import { generateRefreshToken, generateToken, verifyToken } from "../helpers/jwt.helper";
import { User } from "../models";
import { UserAttributes } from "../models/user.model";


const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'] as const;
type ExcludedUserKeys = typeof ATTRIBUTES_TO_EXCLUDE[number];
// "password" | "refresh_token" | "is_deleted"


export class AuthService {

    private sanitizeUser(user: User) {
        const userJson: UserAttributes = user.toJSON();

        // Tạo bản copy để không mutate instance gốc
        const filteredUser: Partial<UserAttributes> = { ...userJson };

        ATTRIBUTES_TO_EXCLUDE.forEach((key: ExcludedUserKeys) => {
            delete filteredUser[key];
        });

        return filteredUser;
    }

    async login(uow: UnitOfWork, body: LoginRequestBody) {
        if (!body.email || !body.password) {
            throw { status: 400, message: "Email and password are required" };
        }

        const user = await uow.users.findByEmail(body.email);
        if (!user) throw { status: 404, message: "User not found" };

        const { ok, needsRehash } = await verifyPassword(body.password, user.password);
        if (!ok) throw { status: 401, message: "Invalid credentials" };

        if (needsRehash) {
            const newHashed = await hashPassword(body.password);
            await uow.users.updatePassword(user.id, newHashed);
        }

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        await uow.users.updateRefreshToken(user.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: this.sanitizeUser(user)
        };
    }

    async register(uow: UnitOfWork, body: RegisterRequestBody) {
        if (!body.email || !body.password || !body.first_name || !body.last_name || !body.address || !body.phone_number || !body.birthday) {
            throw { status: 400, message: "Missing required fields" };
        }

        const existedUser = await uow.users.findByEmail(body.email);
        if (existedUser) throw { status: 400, message: "Email already registered" };

        await uow.start(); // ✅ start transaction

        try {
            const hashedPassword = await hashPassword(body.password);

            const newUser = await uow.users.create({
                email: body.email,
                password: hashedPassword,
                first_name: body.first_name,
                last_name: body.last_name,
                dob: body.birthday,
                gender: body.gender,
                phone_number: body.phone_number,
                role: "USER",
                is_deleted: false,
            });

            await uow.userAddresses.create({
                user_id: newUser.id,
                full_address: body.address,
                is_default: true,
                label: "Home",
                is_deleted: false,
            });

            const accessToken = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            await uow.users.updateRefreshToken(newUser.id, refreshToken);

            await uow.commit(); // ✅ commit mọi thứ

            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: this.sanitizeUser(newUser)
            };
        } catch (error) {
            await uow.rollback(); // ❗ rollback toàn bộ nếu có lỗi
            throw error;
        }
    }


    async refreshToken(uow: UnitOfWork, token: string) {
        let payload;
        try {
            payload = verifyToken(token);
        } catch {
            throw { status: 401, message: "Invalid or expired refresh token" };
        }

        const user = await uow.users.findByRefreshToken(token);
        if (!user) throw { status: 404, message: "User not found or refresh token revoked" };

        const newRefresh = generateRefreshToken(user);
        const newAccess = generateToken(user);

        await uow.users.updateRefreshToken(user.id, newRefresh);

        return {
            access_token: newAccess,
            refresh_token: newRefresh
        };
    }

    async logout(uow: UnitOfWork, token: string) {
        const user = await uow.users.findByRefreshToken(token);
        if (!user) return; // idempotent
        await uow.users.updateRefreshToken(user.id, null);
    }

    async me(uow: UnitOfWork, token: string) {
        let userDecode;
        try {
            userDecode = verifyToken(token);
        } catch {
            throw { status: 401, message: "Invalid or expired token" };
        }
        if (!userDecode) {
            throw { status: 401, message: "You Have To LogIn First" };
        }
        const user = await uow.users.findById(userDecode.user_id);
        if (!user) throw { status: 404, message: "User not found" };

        return this.sanitizeUser(user);
    }
}

export const authService = new AuthService();
