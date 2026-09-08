CREATE TABLE `training_documents` (
	`enrollment_id` text NOT NULL,
	`document_id` text NOT NULL,
	`title` text NOT NULL,
	`owner` text NOT NULL,
	`status` text NOT NULL,
	PRIMARY KEY(`enrollment_id`, `document_id`)
);
--> statement-breakpoint
CREATE TABLE `training_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_name` text NOT NULL,
	`employee_role` text NOT NULL,
	`employee_branch` text NOT NULL,
	`course_code` text NOT NULL,
	`course_title` text NOT NULL,
	`course_date` text NOT NULL,
	`trainer` text NOT NULL,
	`recipient` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at_epoch_ms` integer NOT NULL,
	`email_status` text NOT NULL,
	`status` text NOT NULL,
	`test_score` integer,
	`employee_signed` integer NOT NULL,
	`trainer_signed` integer NOT NULL,
	`practical_passed` integer
);
