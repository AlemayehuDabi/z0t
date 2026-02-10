/*
  Warnings:

  - The values [FIX] on the enum `GenerationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GenerationType_new" AS ENUM ('ARCHITECTURE', 'CODE', 'REFACTOR', 'REVIEW', 'TERMINAL');
ALTER TABLE "Generation" ALTER COLUMN "type" TYPE "GenerationType_new" USING ("type"::text::"GenerationType_new");
ALTER TYPE "GenerationType" RENAME TO "GenerationType_old";
ALTER TYPE "GenerationType_new" RENAME TO "GenerationType";
DROP TYPE "public"."GenerationType_old";
COMMIT;
