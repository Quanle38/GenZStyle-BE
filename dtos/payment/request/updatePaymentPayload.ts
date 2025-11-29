export interface UpdatePaymentPayload {
    gateway?: string | null;
    amount?: number;
    type?: 'in' | 'out';
    reference_number?: string | null;
    status?: string; // VD: 'pending', 'completed', 'failed', 'refunded'
}