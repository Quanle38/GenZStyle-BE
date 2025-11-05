export interface VariantResponseBody {
    id: string;
    product_id: string;
    size: number;
    color: string;
    stock: number;
    price: number;
    image: string | null;
    created_at: Date;
    updated_at: Date;
}