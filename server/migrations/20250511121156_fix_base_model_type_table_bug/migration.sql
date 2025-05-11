/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `BaseModelType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseModelType_name_key" ON "BaseModelType"("name");
