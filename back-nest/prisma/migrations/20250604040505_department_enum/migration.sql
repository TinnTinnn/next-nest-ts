/*
  Warnings:

  - Changed the type of `supplier` on the `StockIn` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `department` on the `StockOut` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Supplier" AS ENUM ('CARPIGIANI', 'TAYLOR', 'BRAVO', 'NISSEI', 'ELECTROLUX', 'GRAM', 'TECNICHE', 'ITALGEL', 'PREGEL');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('Production', 'Marketing', 'Maintenance', 'QualityControl', 'Logistics', 'Accounting', 'HumanResources');

-- AlterTable
ALTER TABLE "StockIn" DROP COLUMN "supplier",
ADD COLUMN     "supplier" "Supplier" NOT NULL;

-- AlterTable
ALTER TABLE "StockOut" DROP COLUMN "department",
ADD COLUMN     "department" "Department" NOT NULL;
