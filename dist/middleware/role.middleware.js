"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(403).json({
                message: "Access denied : You dont have permission on this route"
            });
        }
        if (allowedRoles.includes(userRole)) {
            next();
        }
        else {
            return res.status(403).json({
                message: "Access denied : You dont have permission on this route"
            });
        }
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=role.middleware.js.map