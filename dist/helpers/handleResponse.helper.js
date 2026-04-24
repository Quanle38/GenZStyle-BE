"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleResponse = (res, statusCode = 500, data) => {
    return res.status(statusCode).json(data);
};
exports.default = handleResponse;
//# sourceMappingURL=handleResponse.helper.js.map