-- SQL for auth, migration 0001_initial
BEGIN;
--
-- Create model Permission
--
CREATE TABLE "auth_permission" ("id" integer NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "name" varchar(50) NOT NULL, "content_type_id" integer NOT NULL, "codename" varchar(100) NOT NULL);
--
-- Create model Group
--
CREATE TABLE "auth_group" ("id" integer NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "name" varchar(80) NOT NULL UNIQUE);
CREATE TABLE "auth_group_permissions" ("id" bigint NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "group_id" integer NOT NULL, "permission_id" integer NOT NULL);
--
-- Create model User
--
-- (no-op)
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_codename_01ab375a_uniq" UNIQUE ("content_type_id", "codename");
ALTER TABLE "auth_permission" ADD CONSTRAINT "auth_permission_content_type_id_2f476e4b_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "auth_permission_content_type_id_2f476e4b" ON "auth_permission" ("content_type_id");
CREATE INDEX "auth_group_name_a6ea08ec_like" ON "auth_group" ("name" varchar_pattern_ops);
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" UNIQUE ("group_id", "permission_id");
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" ("group_id");
CREATE INDEX "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" ("permission_id");
COMMIT;

-- SQL for auth, migration 0002_alter_permission_name_max_length
BEGIN;
--
-- Alter field name on permission
--
ALTER TABLE "auth_permission" ALTER COLUMN "name" TYPE varchar(255);
COMMIT;

-- SQL for auth, migration 0003_alter_user_email_max_length
BEGIN;
--
-- Alter field email on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0004_alter_user_username_opts
BEGIN;
--
-- Alter field username on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0005_alter_user_last_login_null
BEGIN;
--
-- Alter field last_login on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0006_require_contenttypes_0002

-- SQL for auth, migration 0007_alter_validators_add_error_messages
BEGIN;
--
-- Alter field username on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0008_alter_user_username_max_length
BEGIN;
--
-- Alter field username on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0009_alter_user_last_name_max_length
BEGIN;
--
-- Alter field last_name on user
--
-- (no-op)
COMMIT;

-- SQL for auth, migration 0010_alter_group_name_max_length
BEGIN;
--
-- Alter field name on group
--
ALTER TABLE "auth_group" ALTER COLUMN "name" TYPE varchar(150);
COMMIT;

-- SQL for auth, migration 0011_update_proxy_permissions
BEGIN;
--
-- Raw Python operation
--
-- THIS OPERATION CANNOT BE WRITTEN AS SQL
COMMIT;

-- SQL for auth, migration 0012_alter_user_first_name_max_length
BEGIN;
--
-- Alter field first_name on user
--
-- (no-op)
COMMIT;

-- SQL for admin, migration 0001_initial
BEGIN;
--
-- Create model LogEntry
--
CREATE TABLE "django_admin_log" ("id" integer NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "action_time" timestamp with time zone NOT NULL, "object_id" text NULL, "object_repr" varchar(200) NOT NULL, "action_flag" smallint NOT NULL CHECK ("action_flag" >= 0), "change_message" text NOT NULL, "content_type_id" integer NULL, "user_id" uuid NOT NULL);
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_content_type_id_c4bce8eb_fk_django_co" FOREIGN KEY ("content_type_id") REFERENCES "django_content_type" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "django_admin_log" ADD CONSTRAINT "django_admin_log_user_id_c564eba6_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" ("content_type_id");
CREATE INDEX "django_admin_log_user_id_c564eba6" ON "django_admin_log" ("user_id");
COMMIT;

-- SQL for admin, migration 0002_logentry_remove_auto_add
BEGIN;
--
-- Alter field action_time on logentry
--
-- (no-op)
COMMIT;

-- SQL for admin, migration 0003_logentry_add_action_flag_choices
BEGIN;
--
-- Alter field action_flag on logentry
--
-- (no-op)
COMMIT;

-- SQL for contenttypes, migration 0001_initial
BEGIN;
--
-- Create model ContentType
--
CREATE TABLE "django_content_type" ("id" integer NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "name" varchar(100) NOT NULL, "app_label" varchar(100) NOT NULL, "model" varchar(100) NOT NULL);
--
-- Alter unique_together for contenttype (1 constraint(s))
--
ALTER TABLE "django_content_type" ADD CONSTRAINT "django_content_type_app_label_model_76bd3d3b_uniq" UNIQUE ("app_label", "model");
COMMIT;

-- SQL for contenttypes, migration 0002_remove_content_type_name
BEGIN;
--
-- Change Meta options on contenttype
--
-- (no-op)
--
-- Alter field name on contenttype
--
ALTER TABLE "django_content_type" ALTER COLUMN "name" DROP NOT NULL;
--
-- Raw Python operation
--
-- THIS OPERATION CANNOT BE WRITTEN AS SQL
--
-- Remove field name from contenttype
--
ALTER TABLE "django_content_type" DROP COLUMN "name" CASCADE;
COMMIT;

-- SQL for sessions, migration 0001_initial
BEGIN;
--
-- Create model Session
--
CREATE TABLE "django_session" ("session_key" varchar(40) NOT NULL PRIMARY KEY, "session_data" text NOT NULL, "expire_date" timestamp with time zone NOT NULL);
CREATE INDEX "django_session_session_key_c0390e0f_like" ON "django_session" ("session_key" varchar_pattern_ops);
CREATE INDEX "django_session_expire_date_a5c62663" ON "django_session" ("expire_date");
COMMIT;

-- SQL for user, migration 0001_initial
BEGIN;
--
-- Create model ArcUser
--
CREATE TABLE "arc_user" ("password" varchar(128) NOT NULL, "last_login" timestamp with time zone NULL, "is_superuser" boolean NOT NULL, "id" uuid NOT NULL PRIMARY KEY, "firebase_uid" varchar(255) NOT NULL UNIQUE, "email" varchar(254) NOT NULL UNIQUE, "first_name" varchar(30) NOT NULL, "last_name" varchar(30) NOT NULL, "phone_number" varchar(15) NULL, "address" varchar(255) NULL, "is_active" boolean NOT NULL, "is_staff" boolean NOT NULL, "date_joined" timestamp with time zone NOT NULL, "inputTokensConsumedChatDeleted" integer NOT NULL, "outputTokensConsumedChatDeleted" integer NOT NULL, "tier" varchar(10) NOT NULL);
CREATE TABLE "arc_user_groups" ("id" bigint NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "arcuser_id" uuid NOT NULL, "group_id" integer NOT NULL);
CREATE TABLE "arc_user_user_permissions" ("id" bigint NOT NULL PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, "arcuser_id" uuid NOT NULL, "permission_id" integer NOT NULL);
CREATE INDEX "arc_user_firebase_uid_ff7f87db_like" ON "arc_user" ("firebase_uid" varchar_pattern_ops);
CREATE INDEX "arc_user_email_69a795a3_like" ON "arc_user" ("email" varchar_pattern_ops);
ALTER TABLE "arc_user_groups" ADD CONSTRAINT "arc_user_groups_arcuser_id_group_id_7753600d_uniq" UNIQUE ("arcuser_id", "group_id");
ALTER TABLE "arc_user_groups" ADD CONSTRAINT "arc_user_groups_arcuser_id_a21cc271_fk_arc_user_id" FOREIGN KEY ("arcuser_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "arc_user_groups" ADD CONSTRAINT "arc_user_groups_group_id_2ac277ad_fk_auth_group_id" FOREIGN KEY ("group_id") REFERENCES "auth_group" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "arc_user_groups_arcuser_id_a21cc271" ON "arc_user_groups" ("arcuser_id");
CREATE INDEX "arc_user_groups_group_id_2ac277ad" ON "arc_user_groups" ("group_id");
ALTER TABLE "arc_user_user_permissions" ADD CONSTRAINT "arc_user_user_permission_arcuser_id_permission_id_5ded68e0_uniq" UNIQUE ("arcuser_id", "permission_id");
ALTER TABLE "arc_user_user_permissions" ADD CONSTRAINT "arc_user_user_permissions_arcuser_id_7ff91c2d_fk_arc_user_id" FOREIGN KEY ("arcuser_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "arc_user_user_permissions" ADD CONSTRAINT "arc_user_user_permis_permission_id_eb6e55d6_fk_auth_perm" FOREIGN KEY ("permission_id") REFERENCES "auth_permission" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "arc_user_user_permissions_arcuser_id_7ff91c2d" ON "arc_user_user_permissions" ("arcuser_id");
CREATE INDEX "arc_user_user_permissions_permission_id_eb6e55d6" ON "arc_user_user_permissions" ("permission_id");
COMMIT;

-- SQL for workbook, migration 0001_initial
BEGIN;
--
-- Create model DataTableMeta
--
CREATE TABLE "data_table_meta" ("id" varchar(36) NOT NULL PRIMARY KEY, "name" varchar(255) NOT NULL, "description" text NOT NULL, "dataSourceAdded" boolean NOT NULL, "dataSource" varchar(10) NULL, "extractionStatus" varchar(10) NOT NULL, "extractionDetails" text NOT NULL, "user_id" uuid NOT NULL);
--
-- Create model DataTableColumnMeta
--
CREATE TABLE "data_table_column_meta" ("id" varchar(36) NOT NULL PRIMARY KEY, "name" varchar(255) NOT NULL, "dtype" varchar(7) NOT NULL, "format" varchar(100) NULL, "order" integer NOT NULL CHECK ("order" >= 0), "description" text NOT NULL, "user_id" uuid NOT NULL, "dataTable_id" varchar(36) NOT NULL);
--
-- Create model Formula
--
CREATE TABLE "formula" ("id" varchar(36) NOT NULL PRIMARY KEY, "fromulaType" varchar(5) NOT NULL, "threadId" varchar(64) NULL, "createdAt" timestamp with time zone NOT NULL, "updatedAt" timestamp with time zone NOT NULL, "name" varchar(255) NULL, "description" text NULL, "arcSql" text NULL, "rawArcSql" jsonb NULL, "isActive" boolean NOT NULL, "isValidated" boolean NOT NULL, "dataTable_id" varchar(36) NULL, "user_id" uuid NOT NULL);
--
-- Create model FormulaMessage
--
CREATE TABLE "formula_message" ("id" varchar(36) NOT NULL PRIMARY KEY, "createdAt" timestamp with time zone NOT NULL, "userType" varchar(5) NOT NULL, "messageType" varchar(5) NOT NULL, "name" varchar(255) NULL, "description" text NULL, "rawArcSql" jsonb NULL, "text" text NULL, "retries" integer NOT NULL, "runDetails" jsonb NOT NULL, "inputTokensConsumed" integer NOT NULL, "outputTokensConsumed" integer NOT NULL, "formula_id" varchar(36) NOT NULL, "user_id" uuid NOT NULL);
--
-- Create model Report
--
CREATE TABLE "report" ("id" varchar(36) NOT NULL PRIMARY KEY, "rows" jsonb NOT NULL, "sharedWith" jsonb NOT NULL, "user_id" uuid NOT NULL);
--
-- Create model Workbook
--
CREATE TABLE "workbook" ("id" varchar(36) NOT NULL PRIMARY KEY, "createdAt" timestamp with time zone NOT NULL, "dataTable_id" varchar(36) NULL UNIQUE, "report_id" varchar(36) NULL UNIQUE, "user_id" uuid NOT NULL);
--
-- Add field workbook to formula
--
ALTER TABLE "formula" ADD COLUMN "workbook_id" varchar(36) NOT NULL CONSTRAINT "formula_workbook_id_1fa3d4b7_fk_workbook_id" REFERENCES "workbook"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "formula_workbook_id_1fa3d4b7_fk_workbook_id" IMMEDIATE;
ALTER TABLE "data_table_meta" ADD CONSTRAINT "data_table_meta_user_id_01d346f0_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "data_table_meta_id_7f9536fc_like" ON "data_table_meta" ("id" varchar_pattern_ops);
CREATE INDEX "data_table_meta_user_id_01d346f0" ON "data_table_meta" ("user_id");
ALTER TABLE "data_table_column_meta" ADD CONSTRAINT "data_table_column_meta_user_id_17463fe8_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "data_table_column_meta" ADD CONSTRAINT "data_table_column_me_dataTable_id_0bb84ef2_fk_data_tabl" FOREIGN KEY ("dataTable_id") REFERENCES "data_table_meta" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "data_table_column_meta_id_d46b6b37_like" ON "data_table_column_meta" ("id" varchar_pattern_ops);
CREATE INDEX "data_table_column_meta_user_id_17463fe8" ON "data_table_column_meta" ("user_id");
CREATE INDEX "data_table_column_meta_dataTable_id_0bb84ef2" ON "data_table_column_meta" ("dataTable_id");
CREATE INDEX "data_table_column_meta_dataTable_id_0bb84ef2_like" ON "data_table_column_meta" ("dataTable_id" varchar_pattern_ops);
ALTER TABLE "formula" ADD CONSTRAINT "formula_dataTable_id_ff697e15_fk_data_table_meta_id" FOREIGN KEY ("dataTable_id") REFERENCES "data_table_meta" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "formula" ADD CONSTRAINT "formula_user_id_43573845_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "formula_id_4bf1d36b_like" ON "formula" ("id" varchar_pattern_ops);
CREATE INDEX "formula_dataTable_id_ff697e15" ON "formula" ("dataTable_id");
CREATE INDEX "formula_dataTable_id_ff697e15_like" ON "formula" ("dataTable_id" varchar_pattern_ops);
CREATE INDEX "formula_user_id_43573845" ON "formula" ("user_id");
ALTER TABLE "formula_message" ADD CONSTRAINT "formula_message_formula_id_361b8229_fk_formula_id" FOREIGN KEY ("formula_id") REFERENCES "formula" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "formula_message" ADD CONSTRAINT "formula_message_user_id_28880527_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "formula_message_id_02fa1251_like" ON "formula_message" ("id" varchar_pattern_ops);
CREATE INDEX "formula_message_formula_id_361b8229" ON "formula_message" ("formula_id");
CREATE INDEX "formula_message_formula_id_361b8229_like" ON "formula_message" ("formula_id" varchar_pattern_ops);
CREATE INDEX "formula_message_user_id_28880527" ON "formula_message" ("user_id");
ALTER TABLE "report" ADD CONSTRAINT "report_user_id_07ece6b6_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "report_id_0debcac0_like" ON "report" ("id" varchar_pattern_ops);
CREATE INDEX "report_user_id_07ece6b6" ON "report" ("user_id");
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_dataTable_id_0e577e42_fk_data_table_meta_id" FOREIGN KEY ("dataTable_id") REFERENCES "data_table_meta" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_report_id_d27a0768_fk_report_id" FOREIGN KEY ("report_id") REFERENCES "report" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "workbook" ADD CONSTRAINT "workbook_user_id_8c26bec3_fk_arc_user_id" FOREIGN KEY ("user_id") REFERENCES "arc_user" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "workbook_id_35e6ae64_like" ON "workbook" ("id" varchar_pattern_ops);
CREATE INDEX "workbook_dataTable_id_0e577e42_like" ON "workbook" ("dataTable_id" varchar_pattern_ops);
CREATE INDEX "workbook_report_id_d27a0768_like" ON "workbook" ("report_id" varchar_pattern_ops);
CREATE INDEX "workbook_user_id_8c26bec3" ON "workbook" ("user_id");
CREATE INDEX "formula_workbook_id_1fa3d4b7" ON "formula" ("workbook_id");
CREATE INDEX "formula_workbook_id_1fa3d4b7_like" ON "formula" ("workbook_id" varchar_pattern_ops);
COMMIT;

