// controllers/product.controller.ts
import { Request, Response } from "express";
import baseModel from "../models/base.model";
import handleError from "../helpers/handleError.helper";
import productTable from "../models/schema/product.schema"
import variantTable from "../models/schema/variant.schema"
const productController = {
  search: async (req: Request, res: Response) => {
    try {
      let whereClause = "";

      const filters: Record<string, any> = req.query as Record<string, any>;
      // name, brand, minPrice, maxPrice, color, size
      const values: any[] = [];
      const conditions: string[] = [];

      if (filters.name) {
        values.push(`%${filters.name.trim()}%`);
        conditions.push(`p.${productTable.columns.name} ILIKE ${values.slice(values.length - 1)}`);
      }

      if (filters.brand) {
        values.push(filters.brand.trim());
        conditions.push(`p.${productTable.columns.brand} = ${values.slice(values.length - 1)}`);
      }

      if (filters.minPrice) {
        values.push(Number(filters.minPrice));
        conditions.push(`v.${variantTable.columns.price} >= $${values.length}`);
      }

      if (filters.maxPrice) {
        values.push(Number(filters.maxPrice));
        conditions.push(`v.${variantTable.columns.price} <= $${values.length}`);
      }

      if (filters.color) {
        values.push(filters.color.trim());
        conditions.push(`v.${variantTable.columns.color} = ${values.slice(values.length - 1)}`);
      }

      if (filters.size) {
        values.push(filters.size.trim());
        conditions.push(`v.${variantTable.columns.size} = ${values.slice(values.length - 1)}`);
      }

      if (conditions.length > 0) {
        whereClause += conditions.join(" AND ");
      }
      const { minPrice, maxPrice, ...newFilter } = filters;
      console.log("filters", filters)
      console.log("whereClause", whereClause);
      const data = await baseModel.search(productTable.name, filters, [{
        table: variantTable.name,
        on: variantTable.columns.product_id
      }],
        whereClause
      );
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return handleError(res, 500, error);
    }
  },
};

export default productController;
//SELECT
//     p.${productTable.columns.id},
//     p.${productTable.columns.name},
//     p.base_price,
//     p.description,
//     p.thumbnail,
//     COALESCE(
//       json_agg(
//         DISTINCT jsonb_build_object(
//           'variant_id', v.${variantTable.columns.variant_id},
//           'size', v.${variantTable.columns.size},
//           'color', v.${variantTable.columns.color},
//           'stock', v.${variantTable.columns.stock},
//           'price', v.${variantTable.columns.price},
//           'image', v.${variantTable.columns.image}
//         )
//       ) FILTER (WHERE v.${variantTable.columns.variant_id} IS NOT NULL),
//       '[]'
//     ) as variants
//   FROM "${productTable.name}" p
//   LEFT JOIN "${variantTable.name}" v
//   ON p.${productTable.columns.id} = v.${variantTable.columns.product_id}
//   WHERE p.${productTable.columns.is_deleted} = false
// `;

// const values: any[] = [];
// const conditions: string[] = [];

// if (filters.name) {
//   values.push(`%${filters.name.trim()}%`);
//   conditions.push(`p.${productTable.columns.name} ILIKE ${values.slice(values.length-1)}`);
// }

// if (filters.brand) {
//   values.push(filters.brand.trim());
//   conditions.push(`p.${productTable.columns.brand} = ${values.slice(values.length-1)}`);
// }

// if (filters.minPrice) {
//   values.push(Number(filters.minPrice));
//   conditions.push(`v.${variantTable.columns.price} >= ${values.slice(values.length-1)}`);
// }

// if (filters.maxPrice) {
//   values.push(Number(filters.maxPrice));
//   conditions.push(`v.${variantTable.columns.price} <= ${values.slice(values.length-1)}`);
// }

// if (filters.color) {
//   values.push(filters.color.trim());
//   conditions.push(`v.${variantTable.columns.color} = ${values.slice(values.length-1)}`);
// }

// if (filters.size) {
//   values.push(filters.size.trim());
//   conditions.push(`v.${variantTable.columns.size} = ${values.slice(values.length-1)}`);
// }

// if (conditions.length > 0) {
//   query += " AND " + conditions.join(" AND ");
// }

// query += ` GROUP BY p.${productTable.columns.id}`;

// console.log("FINAL QUERY:", query);
// console.log("VALUES:", values);
// const result = await pool.query(query, values);
// return result.rows;