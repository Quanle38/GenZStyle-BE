"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleError = (res, statusCode = 500, error) => {
    return res.status(statusCode).json({
        message: error,
        data: null
    });
};
exports.default = handleError;
//# sourceMappingURL=handleError.helper.js.map