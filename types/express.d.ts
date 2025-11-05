// types/express.d.ts
import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            user_id: string;
            email: string;
            role: string;
            iat?: number;
            exp?: number;
        };
    }
}