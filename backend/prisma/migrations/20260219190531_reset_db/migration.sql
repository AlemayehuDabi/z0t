/*
  Warnings:

  - You are about to drop the column `inputContext` on the `Generation` table. All the data in the column will be lost.
  - Added the required column `outputFormat` to the `Generation` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `output` on the `Generation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OutputFormat" AS ENUM ('TEXT', 'FILE_TREE');

-- AlterTable
ALTER TABLE "Generation" DROP COLUMN "inputContext",
ADD COLUMN     "outputFormat" "OutputFormat" NOT NULL,
DROP COLUMN "output",
ADD COLUMN     "output" JSONB NOT NULL;
