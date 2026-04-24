"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const password_helper_1 = require("../helpers/password.helper");
const jwt_helper_1 = require("../helpers/jwt.helper");
const role_enum_1 = require("../enums/role.enum");
const membership_1 = require("../enums/membership");
const ATTRIBUTES_TO_EXCLUDE = ['password', 'refresh_token', 'is_deleted'];
// "password" | "refresh_token" | "is_deleted"
class AuthService {
    sanitizeUser(user) {
        const userJson = user.toJSON();
        // Tạo bản copy để không mutate instance gốc
        const filteredUser = { ...userJson };
        ATTRIBUTES_TO_EXCLUDE.forEach((key) => {
            delete filteredUser[key];
        });
        return filteredUser;
    }
    async getUserFromToken(uow, token) {
        let userDecode;
        try {
            userDecode = (0, jwt_helper_1.verifyToken)(token);
        }
        catch {
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
    async login(uow, body) {
        if (!body.email || !body.password) {
            throw { status: 400, message: "Email and password are required" };
        }
        const user = await uow.users.findByEmail(body.email);
        if (!user)
            throw { status: 404, message: "User not found" };
        const { ok, needsRehash } = await (0, password_helper_1.verifyPassword)(body.password, user.password);
        if (!ok)
            throw { status: 401, message: "Invalid credentials" };
        if (needsRehash) {
            const newHashed = await (0, password_helper_1.hashPassword)(body.password);
            await uow.users.updatePassword(user.id, newHashed);
        }
        const refreshToken = (0, jwt_helper_1.generateRefreshToken)(user);
        await uow.users.updateRefreshToken(user.id, refreshToken);
        return {
            access_token: refreshToken,
            user: this.sanitizeUser(user)
        };
    }
    async register(uow, body) {
        await uow.start();
        try {
            if (!body.email || !body.password || !body.first_name || !body.last_name || !body.address || !body.phone_number || !body.birthday || !body.gender) {
                throw { status: 400, message: "Missing required fields" };
            }
            const existedUser = await uow.users.findByEmail(body.email);
            if (existedUser)
                throw { status: 400, message: "Email already registered" };
            const gender = body.gender.toUpperCase();
            const hashedPassword = await (0, password_helper_1.hashPassword)(body.password);
            const userData = {
                email: body.email,
                password: hashedPassword,
                first_name: body.first_name,
                last_name: body.last_name,
                dob: new Date(body.birthday),
                gender: gender,
                phone_number: body.phone_number,
                role: role_enum_1.ROLE.USER,
                is_deleted: false,
                membership_id: membership_1.Membership.BRONZE,
                avatar: body.avatar ? body.avatar : ""
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
            const accessToken = (0, jwt_helper_1.generateToken)(newUser);
            const refreshToken = (0, jwt_helper_1.generateRefreshToken)(newUser);
            await uow.users.updateRefreshToken(newUser.id, refreshToken);
            await uow.commit();
            return {
                access_token: accessToken,
                refresh_token: refreshToken,
                user: this.sanitizeUser(newUser)
            };
        }
        catch (error) {
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
    async refreshToken(uow, token) {
        let payload;
        try {
            payload = (0, jwt_helper_1.verifyToken)(token);
        }
        catch {
            throw { status: 401, message: "Invalid or expired refresh token" };
        }
        const user = await uow.users.findByRefreshToken(token);
        if (!user)
            throw { status: 404, message: "User not found or refresh token revoked" };
        const newRefresh = (0, jwt_helper_1.generateRefreshToken)(user);
        await uow.users.updateRefreshToken(user.id, newRefresh);
        return {
            access_token: newRefresh,
        };
    }
    async logout(uow, token) {
        const user = await uow.users.findByRefreshToken(token);
        if (!user)
            return; // idempotent
        await uow.users.updateRefreshToken(user.id, null);
    }
    async me(uow, token) {
        const user = await this.getUserFromToken(uow, token);
        return this.sanitizeUser(user);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map