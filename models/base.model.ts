import pool from "../config/connection";
import { Pagination } from "../types/pagination";
import productTable from "../models/schema/product.schema";
import variantTable from "../models/schema/variant.schema";

const baseModel = {
  findAll: async (
    tableName: string,
    columns: string[] = ["*"],
    { limit, skip }: Pagination = {}
  ) => {
    let cols = "*";
    try {
      // chọn cột
      if (columns !== undefined) {
        cols = columns.join(", ");
      }
      // query cơ bản
      let query = `SELECT ${cols} FROM "${tableName}" WHERE is_deleted = false `;
      const values: any[] = [];

      // thêm LIMIT & OFFSET nếu có
      if (limit !== undefined) {
        values.push(limit);
        query += ` LIMIT $${values.length}`;
        console.log("limit", query)
      }
      if (skip !== undefined) {
        values.push(skip);
        query += ` OFFSET $${values.length}`;
        console.log("offset", query)
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error: any) {
      console.error("❌ Pagination error:", error);
      throw new Error("Pagination failed: " + error.message);
    }
  },
  findOne: async (
    tableName: string,
    fieldIdName: string,
    id: string | number,
    columns: string[] = ["*"]
  ) => {
    try {

      let cols = "*";
      if (columns && columns.length > 0) {
        cols = columns.join(", ");
      }

      // query cơ bản (⚠️ nên dùng param thay vì chèn trực tiếp để tránh SQL Injection)
      const query = `SELECT ${cols} FROM "${tableName}" WHERE ${fieldIdName} = $1 AND  is_deleted = false`;
      console.log("🟡 Final Query :", query);

      const result = await pool.query(query, [id]);
      console.log("✅ Query Result:", result.rows);

      return result.rows;
    } catch (error: any) {
      console.error("❌ findOne Error:", error);
      throw new Error("findOne failed: " + error.message);
    }
  },
  update: async (
    tableName: string,
    arrayFieldKeys: string[],
    arrayFieldValues: any[],
    fieldIdName: string,
    id: string | number,
  ) => {
    try {
      if (!arrayFieldKeys || arrayFieldKeys.length === 0) return;

      const setClause = arrayFieldKeys
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(", ");

      const query = `UPDATE "${tableName}" SET ${setClause} WHERE ${fieldIdName} = $${arrayFieldKeys.length + 1} RETURNING *`;

      const values = [...arrayFieldValues, id];

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error: any) {
      console.error("❌ update Error:", error);
      throw new Error("update failed: " + error.message);
    }
  },
  deletedOne: async (
    tableName: string,
    idFieldName: string,
    id: string,
  ) => {
    try {
      const query = `UPDATE "${tableName}" SET is_deleted = true WHERE "${idFieldName}" = $1`;
      const values = [id];
      await pool.query(query, values);
    } catch (error: any) {
      console.error("❌ Delete Error:", error);
      throw new Error("Delete failed: " + error.message);
    }
  },
  create: async (
    tableName: string,
    data: Record<string, any>
  ) => {
    try {
      const keys = Object.keys(data); // ['user_id','first_name','last_name','email','is_deleted']
      const values = Object.values(data); // ['U003','David','Nguyen','david@example.com',false]
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", "); // $1,$2,$3,$4,$5

      const query = `
    INSERT INTO "${tableName}" (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *;
  `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      console.error("❌ Create Error:", error);
      throw new Error(" Create failed: " + error.message);

    }
  },
  search: async (tableName: string,
    searchObject: Record<string, any>,
    joins? : {table : string; on : string}[],
    extraWhere? : string
  ) => {
    try {
       console.log("searchObject",searchObject);
       const fields = Object.keys(searchObject);
       console.log("fields",fields);
      if (fields.length === 0) {
        throw new Error("No fields provided")
      }
      const values = Object.values(searchObject)
      const joinClause = joins ? joins.map((j) => `JOIN "${j.table}" as ${j.table.charAt(0).toLowerCase()} ON ${tableName.charAt(0).toLowerCase()}."${j.on}" = ${j.table.charAt(0).toLowerCase()}."${j.on}"`).join(" ") :"";
      //const whereClause = fields.map( (key,index) => `"${key.replace(/\./g, '"."')}" = $${index + 1} `) 
      //.join("AND ");
     // const fullWhere = extraWhere ? `${whereClause}AND (${extraWhere})` : whereClause;
      const whereClause = extraWhere ? `WHERE ${extraWhere}` : ""
      let query = `SELECT * FROM "${tableName}" as ${tableName.charAt(0).toLowerCase()} ${joinClause} ${whereClause}`
      console.log("query", query);
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error : any) {
      console.error("Search error :", error);
      throw new Error(" Error" + error.message )
    }
 },
};
export default baseModel;

   