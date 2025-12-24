// src/services/auth.service.ts
import { UnitOfWork } from "../unit-of-work/unitOfWork";
import { LoginRequestBody } from "../dtos/auth/request/login.request";
import { RegisterRequestBody } from "../dtos/auth/request/register.request";
import { hashPassword, verifyPassword } from "../helpers/password.helper";
import { generateRefreshToken, generateToken, verifyToken } from "../helpers/jwt.helper";
import { User } from "../models";
import { UserAttributes } from "../models/user.model";
import { ROLE } from "../enums/role.enum";
import { Membership } from "../enums/membership";


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
    async getUserFromToken(uow: UnitOfWork, token: string): Promise<User> {
        let userDecode;
        try {
            userDecode = verifyToken(token);
        } catch {
            throw { status: 401, message: "Invalid or expired token" };
        }

        if (!userDecode) {
            throw { status: 401, message: "You have to login first" };
        }

        const user = await uow.users.findById(userDecode.user_id);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }

        return user;
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

        const refreshToken = generateRefreshToken(user);

        await uow.users.updateRefreshToken(user.id, refreshToken);

        return {
            access_token: refreshToken,
            user: this.sanitizeUser(user)
        };
    }

    async register(uow: UnitOfWork, body: RegisterRequestBody) {
        await uow.start();
        try {
        if (!body.email || !body.password || !body.first_name || !body.last_name || !body.address || !body.phone_number || !body.birthday || !body.gender) {
            throw { status: 400, message: "Missing required fields" };
        }
        const existedUser = await uow.users.findByEmail(body.email);
        if (existedUser) throw { status: 400, message: "Email already registered" };
            const gender = body.gender.toUpperCase();
            const hashedPassword = await hashPassword(body.password);
            const userData: Partial<User> = {
                email: body.email,
                password: hashedPassword,
                first_name: body.first_name,
                last_name: body.last_name,
                dob: new Date(body.birthday),
                gender: gender,
                phone_number: body.phone_number,
                role: ROLE.USER,
                is_deleted: false,
                membership_id: Membership.BRONZE,
                avatar : body.avatar ? body.avatar : ""
            };
            console.log("Creating user with data:", userData);

            const newUser = await uow.users.create(userData);

            console.log("User created successfully:", newUser.id);

            const addressData = {
                user_id: newUser.id,
                full_address: body.address,
                is_default: true,
                label: "Home",
                is_deleted: false,
            };

            console.log("Creating address with data:", addressData);

            const address = await uow.userAddresses.create(addressData);

            console.log("Address created successfully:", address.address_id);

            const accessToken = generateToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            await uow.users.updateRefreshToken(newUser.id, refreshToken);

            await uow.commit();

            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: this.sanitizeUser(newUser)
            };
        } catch (error) {
            await uow.rollback();
            // ✅ Log lỗi chi tiết
            console.error("Registration error:", error);

            // ✅ Trả về message cụ thể hơn
            if (error instanceof Error) {
                throw { status: 400, message: error.message, details: error };
            }
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
        await uow.users.updateRefreshToken(user.id, newRefresh);

        return {
            access_token: newRefresh,
        };
    }

    async logout(uow: UnitOfWork, token: string) {
        const user = await uow.users.findByRefreshToken(token);
        if (!user) return; // idempotent
        await uow.users.updateRefreshToken(user.id, null);
    }

    async me(uow: UnitOfWork, token: string) {
        const user = await this.getUserFromToken(uow, token);
        return this.sanitizeUser(user);
    }
}

export const authService = new AuthService();
