// models/schema/productWithVariants.schema.ts
import {Product} from "../../types/tableType"
import {Variant} from "../../types/tableType"
export interface ProductWithVariants extends Product {
  variants: Variant[];
}
