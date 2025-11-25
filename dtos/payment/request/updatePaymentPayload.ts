export interface UpdatePaymentPayload {
    gateway?: string;
    amount?: number;
    type?: 'in' | 'out';
    reference_number?: string | null;
    status?: string; // VD: 'pending', 'completed', 'failed', 'refunded'
}