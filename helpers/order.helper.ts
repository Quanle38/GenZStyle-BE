import { Order } from "../models/order.model";

export function checkOrderOwnership(order: Order | null, userId: string) {
    if (!order) {
        throw new Error("Order not found");
    }

    if (order.user_id !== userId) {
        throw new Error("Access denied");
    }
}