"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseId = (id) => {
    let response = id;
    const key = ["address_id", "id", "condition_id", "favorite_id"];
    key.forEach(element => {
        if (id === element) {
            response = Number(id);
        }
    });
    return response;
};
exports.default = parseId;
//# sourceMappingURL=checkId.js.map