CREATE TABLE `training_enrollment_participants` (
	`enrollment_id` text NOT NULL,
	`participant_name` text NOT NULL,
	`participant_role` text NOT NULL,
	`participant_branch` text NOT NULL,
	`roster_position` integer NOT NULL,
	PRIMARY KEY(`enrollment_id`, `participant_name`)
);
