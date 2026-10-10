import { createFileRoute } from "@tanstack/react-router";
import { query } from "@/lib/db";
import {
  getResourceConfig,
  isResourceWhitelisted,
  coerceValue,
  type ResourceConfig,
} from "@/lib/business-schema";

export const Route = createFileRoute("/api/business/$resource")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const resource = params.resource;
          const cfg = getResourceConfig(resource);

          if (!cfg) {
            return new Response(
              JSON.stringify({ success: false, error: `Unknown business resource: ${resource}` }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }

          const url = new URL(request.url);

          // Return schema metadata (for the admin UI form builder)
          if (url.searchParams.get("meta") === "1") {
            return new Response(JSON.stringify({ success: true, schema: cfg }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          const limit = Math.min(Number(url.searchParams.get("limit")) || 500, 1000);
          const offset = Number(url.searchParams.get("offset")) || 0;
          const q = url.searchParams.get("q")?.trim();
          const startDate = url.searchParams.get("startDate")?.trim();
          const endDate = url.searchParams.get("endDate")?.trim();

          const { sql, countSql, whereParams } = buildListQuery(cfg, q, startDate, endDate);

          const sqlFinal = `${sql} ORDER BY r.${cfg.orderBy} ${cfg.orderDir || "DESC"} LIMIT ${limit} OFFSET ${offset}`;

          // Execute data query and count query concurrently
          const [res, countRes] = await Promise.all([
            query(sqlFinal, whereParams),
            query(countSql, whereParams),
          ]);

          return new Response(
            JSON.stringify({
              success: true,
              rows: res.rows,
              count: countRes.rows[0]?.n ?? res.rows.length,
              columns: buildColumns(cfg),
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (error: any) {
          console.error(`GET /api/business/$resource error:`, error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to fetch records" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      POST: async ({ request, params }) => {
        try {
          const resource = params.resource;
          if (!isResourceWhitelisted(resource)) {
            return new Response(
              JSON.stringify({ success: false, error: `Unknown business resource: ${resource}` }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }
          const cfg = getResourceConfig(resource)!;
          const body = await request.json();

          // Auto generation logic for serial_number, customer_code, booking_number, trip_number
          if (cfg.key === "customers" && !body.customer_code) {
            const rawPhone = String(body.phone || "").replace(/\D/g, "");
            body.customer_code = rawPhone ? `CUST-${rawPhone}` : `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
          }
          if (cfg.key === "day_book_entries" && !body.serial_number) {
            body.serial_number = `SB-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          if ((cfg.key === "cab_bookings" || cfg.key === "hourly_bookings") && !body.booking_number) {
            body.booking_number = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
          }
          if (cfg.key === "package_trips" && !body.trip_number) {
            body.trip_number = `TRIP-${Math.floor(10000 + Math.random() * 90000)}`;
          }

          const columns: string[] = [];
          const placeholders: string[] = [];
          const values: unknown[] = [];

          for (const field of cfg.fields) {
            if (field.readOnly) continue;
            let raw = body[field.name];
            if (raw === undefined || raw === null || raw === "") {
              if (cfg.insertDefaults && field.name in cfg.insertDefaults) {
                raw = cfg.insertDefaults[field.name];
              } else {
                continue;
              }
            }
            columns.push(field.name);
            placeholders.push(`$${values.length + 1}`);
            values.push(coerceValue(field, raw));
          }

          if (columns.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: "No valid fields provided." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const res = await query(
            `INSERT INTO ${cfg.table} (${columns.map((c) => `"${c}"`).join(", ")})
             VALUES (${placeholders.join(", ")}) RETURNING *`,
            values,
          );

          return new Response(JSON.stringify({ success: true, row: res.rows[0] }), {
            status: 201,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error(`POST /api/business/$resource error:`, error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to create record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      PUT: async ({ request, params }) => {
        try {
          const resource = params.resource;
          if (!isResourceWhitelisted(resource)) {
            return new Response(
              JSON.stringify({ success: false, error: `Unknown business resource: ${resource}` }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }
          const cfg = getResourceConfig(resource)!;
          const body = await request.json();
          const id = body.id;

          if (id === undefined || id === null || id === "") {
            return new Response(
              JSON.stringify({ success: false, error: "ID is required for update." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const sets: string[] = [];
          const values: unknown[] = [];

          for (const field of cfg.fields) {
            if (field.readOnly) continue;
            if (!(field.name in body)) continue;
            values.push(coerceValue(field, body[field.name]));
            sets.push(`"${field.name}" = $${values.length}`);
          }

          if (sets.length === 0) {
            return new Response(
              JSON.stringify({ success: false, error: "No fields provided for update." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          values.push(id);
          const res = await query(
            `UPDATE ${cfg.table} SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
            values,
          );

          if (res.rowCount === 0) {
            return new Response(JSON.stringify({ success: false, error: "Record not found." }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true, row: res.rows[0] }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error(`PUT /api/business/$resource error:`, error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to update record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const resource = params.resource;
          if (!isResourceWhitelisted(resource)) {
            return new Response(
              JSON.stringify({ success: false, error: `Unknown business resource: ${resource}` }),
              { status: 404, headers: { "Content-Type": "application/json" } },
            );
          }
          const cfg = getResourceConfig(resource)!;
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          const deleteAll = url.searchParams.get("all") === "true";

          if (deleteAll) {
            await query(`DELETE FROM ${cfg.table}`);
            return new Response(
              JSON.stringify({ success: true, message: `All ${cfg.table} records deleted.` }),
              { headers: { "Content-Type": "application/json" } },
            );
          }

          if (!id) {
            return new Response(JSON.stringify({ success: false, error: "ID is required." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          await query(`DELETE FROM ${cfg.table} WHERE id = $1`, [id]);
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          console.error(`DELETE /api/business/$resource error:`, error);
          return new Response(
            JSON.stringify({ success: false, error: error.message || "Failed to delete record" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});

function buildColumns(cfg: ResourceConfig): string[] {
  const seen = new Set<string>();
  const cols: string[] = [];
  for (const name of cfg.tableColumns) {
    if (seen.has(name)) continue;
    seen.add(name);
    cols.push(name);
  }
  return cols;
}

function getDateColumn(cfg: ResourceConfig): string {
  // Check common date fields in priority order
  const candidates = [
    "booking_date",
    "expense_date",
    "journey_date",
    "transaction_date",
    "payment_date",
    "travel_date",
    "created_at",
  ];
  for (const c of candidates) {
    if (cfg.fields.some((f) => f.name === c) || cfg.tableColumns.includes(c)) {
      return c;
    }
  }
  return "created_at";
}

function buildListQuery(
  cfg: ResourceConfig,
  q?: string,
  startDate?: string,
  endDate?: string,
): { sql: string; countSql: string; whereParams: unknown[] } {
  // LEFT JOIN every reference field so the UI can display friendly labels.
  const joins: string[] = [];
  const selectCols = [`r.*`];

  for (const field of cfg.fields) {
    if (field.type === "reference" && field.ref && field.refLabel) {
      const refCfg = getResourceConfig(field.ref);
      if (!refCfg) continue;
      const alias = `ref__${field.name}`;
      joins.push(`LEFT JOIN ${refCfg.table} ${alias} ON ${alias}.id = r."${field.name}"`);
      selectCols.push(`${alias}."${field.refLabel}" AS "ref__${field.name}"`);
    }
  }

  const whereConditions: string[] = [];
  const whereParams: unknown[] = [];

  if (q && cfg.searchCols.length > 0) {
    const searchConds = cfg.searchCols.map((c) => {
      whereParams.push(`%${q}%`);
      return `r."${c}"::text ILIKE $${whereParams.length}`;
    });
    whereConditions.push(`(${searchConds.join(" OR ")})`);
  }

  if (startDate || endDate) {
    const dateCol = getDateColumn(cfg);
    if (startDate) {
      whereParams.push(startDate);
      whereConditions.push(`r."${dateCol}"::date >= $${whereParams.length}::date`);
    }
    if (endDate) {
      whereParams.push(endDate);
      whereConditions.push(`r."${dateCol}"::date <= $${whereParams.length}::date`);
    }
  }

  const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(" AND ")}` : "";

  return {
    sql: `SELECT ${selectCols.join(", ")} FROM ${cfg.table} r${joins.length ? " " + joins.join(" ") : ""}${whereClause}`,
    countSql: `SELECT COUNT(*)::int AS n FROM ${cfg.table} r${whereClause}`,
    whereParams,
  };
}
