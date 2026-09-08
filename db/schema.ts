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

export const trainingEnrollments = sqliteTable("training_enrollments", {
  id: text("id").primaryKey(),
  employeeName: text("employee_name").notNull(),
  employeeRole: text("employee_role").notNull(),
  employeeBranch: text("employee_branch").notNull(),
  courseCode: text("course_code").notNull(),
  courseTitle: text("course_title").notNull(),
  courseDate: text("course_date").notNull(),
  trainer: text("trainer").notNull(),
  recipient: text("recipient").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAtEpochMs: integer("updated_at_epoch_ms").notNull(),
  emailStatus: text("email_status").notNull(),
  status: text("status").notNull(),
  testScore: integer("test_score"),
  employeeSigned: integer("employee_signed", { mode: "boolean" }).notNull(),
  trainerSigned: integer("trainer_signed", { mode: "boolean" }).notNull(),
  practicalPassed: integer("practical_passed", { mode: "boolean" }),
});

export const trainingDocuments = sqliteTable("training_documents", {
  enrollmentId: text("enrollment_id").notNull(),
  documentId: text("document_id").notNull(),
  title: text("title").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull(),
}, (table) => [
  primaryKey({ columns: [table.enrollmentId, table.documentId] }),
]);

export const trainingEnrollmentParticipants = sqliteTable("training_enrollment_participants", {
  enrollmentId: text("enrollment_id").notNull(),
  participantName: text("participant_name").notNull(),
  participantRole: text("participant_role").notNull(),
  participantBranch: text("participant_branch").notNull(),
  rosterPosition: integer("roster_position").notNull(),
}, (table) => [
  primaryKey({ columns: [table.enrollmentId, table.participantName] }),
]);
