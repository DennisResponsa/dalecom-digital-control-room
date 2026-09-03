import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const operatorAssignments = sqliteTable("operator_assignments", {
  employeeId: text("employee_id").notNull(),
  workdayDate: text("workday_date").notNull(),
  assignmentId: text("assignment_id").notNull(),
  projectId: text("project_id").notNull(),
  orderId: text("order_id").notNull(),
  siteName: text("site_name").notNull(),
  siteStartEpochMs: integer("site_start_epoch_ms").notNull(),
  siteEndEpochMs: integer("site_end_epoch_ms").notNull(),
  teamName: text("team_name").notNull(),
  machineName: text("machine_name").notNull(),
  vehicleName: text("vehicle_name").notNull(),
  instructionVersion: text("instruction_version").notNull(),
  operatorRequired: integer("operator_required", { mode: "boolean" }).notNull(),
  safetyCompliant: integer("safety_compliant", { mode: "boolean" }).notNull(),
  note: text("note").notNull(),
  publishedAtEpochMs: integer("published_at_epoch_ms").notNull(),
}, (table) => [
  primaryKey({ columns: [table.employeeId, table.workdayDate] }),
]);
