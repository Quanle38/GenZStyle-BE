import { generateIdByFormat } from "../helpers/generateId";

export const timeouts: Record<string, NodeJS.Timeout> = {};
export const orderTimeoutMap: Record<string, string> = {}; // map orderCode → timeoutId
export const orders: any = {};

/**
 * Tạo timeout huỷ thanh toán kèm id sinh bằng generateIdByFormat
 */
export function startPaymentTimeout(orderCode: string) {
    // Nếu order đã có timeout trước đó → clear
    if (orderTimeoutMap[orderCode]) {
        const oldTimeoutId = orderTimeoutMap[orderCode];
        clearTimeout(timeouts[oldTimeoutId]);
        delete timeouts[oldTimeoutId];
    }

    // Sinh id timeout theo format
    const timeoutId = generateIdByFormat("TO", 6, Object.keys(timeouts).length + 1);

    // Ghi lại map orderCode -> timeoutId
    orderTimeoutMap[orderCode] = timeoutId;

    // Tạo timeout
    timeouts[timeoutId] = setTimeout(() => {
        const order = orders[orderCode];
        if (order && order.status === "pending") {
            order.status = "failed";
            order.failedAt = new Date().toISOString();
            console.log(
                `\n[TIMEOUT] ${orderCode} => status: failed (THIS PAYMENT CANCELLED AFTER 10 minutes)`
            );
        }

        // Xoá timeout khi hoàn tất
        delete timeouts[timeoutId];
        delete orderTimeoutMap[orderCode];

    }, 600 * 1000);
}