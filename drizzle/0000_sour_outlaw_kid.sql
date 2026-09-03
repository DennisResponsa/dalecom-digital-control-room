CREATE TABLE `operator_assignments` (
	`employee_id` text NOT NULL,
	`workday_date` text NOT NULL,
	`assignment_id` text NOT NULL,
	`project_id` text NOT NULL,
	`order_id` text NOT NULL,
	`site_name` text NOT NULL,
	`site_start_epoch_ms` integer NOT NULL,
	`site_end_epoch_ms` integer NOT NULL,
	`team_name` text NOT NULL,
	`machine_name` text NOT NULL,
	`vehicle_name` text NOT NULL,
	`instruction_version` text NOT NULL,
	`operator_required` integer NOT NULL,
	`safety_compliant` integer NOT NULL,
	`note` text NOT NULL,
	`published_at_epoch_ms` integer NOT NULL,
	PRIMARY KEY(`employee_id`, `workday_date`)
);
