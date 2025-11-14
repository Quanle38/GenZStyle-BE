import { VariantCreateRequestBody } from "../../variant/request/variantCreateRequestBody.dto";

export interface ProductUpdateRequestBody {
        name?:  string;
        description?:  string;
        brand?:  string;
        category?:  string;
        // Quan hệ
        variants?:  VariantDTO[];
}
interface VariantDTO {
        size?:  number;
        color?:  string;
        stock?:  number;
        price?:  number;
        image?:  string | null;
}