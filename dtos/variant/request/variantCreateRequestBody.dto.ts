export interface VariantCreateRequestBody {
        product_id: string;
        size: number;
        color: string;
        stock: number;
        price: number;
        image: string | null;
}