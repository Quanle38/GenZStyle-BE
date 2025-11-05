import { ProductVariantAttributes } from "../../../models/productVariant.model";

export interface CreateRequestBody {
        name: string;
        base_price: number;
        description: string | null;
        thumbnail: string | null;
        brand: string | null;
        category : string;
        // Quan hệ
        variants: ProductVariantAttributes[];
}