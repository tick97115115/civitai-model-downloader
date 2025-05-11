/*
  Warnings:

  - You are about to drop the column `creator` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the column `baseModel` on the `ModelVersion` table. All the data in the column will be lost.
  - You are about to drop the column `baseModelType` on the `ModelVersion` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseModelId` to the `ModelVersion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Creator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "link" TEXT
);

-- CreateTable
CREATE TABLE "ModelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BaseModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BaseModelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "baseModelId" INTEGER NOT NULL,
    CONSTRAINT "BaseModelType_baseModelId_fkey" FOREIGN KEY ("baseModelId") REFERENCES "BaseModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "creatorId" INTEGER,
    "typeId" INTEGER NOT NULL,
    "nsfw" BOOLEAN NOT NULL,
    "nsfwLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Model_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Model_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ModelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Model" ("createdAt", "id", "name", "nsfw", "nsfwLevel", "updatedAt") SELECT "createdAt", "id", "name", "nsfw", "nsfwLevel", "updatedAt" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
CREATE INDEX "Model_name_typeId_creatorId_nsfw_nsfwLevel_idx" ON "Model"("name", "typeId", "creatorId", "nsfw", "nsfwLevel");
CREATE TABLE "new_ModelVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "baseModelId" INTEGER NOT NULL,
    "baseModelTypeId" INTEGER,
    "publishedAt" DATETIME,
    "nsfwLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModelVersion_baseModelId_fkey" FOREIGN KEY ("baseModelId") REFERENCES "BaseModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModelVersion_baseModelTypeId_fkey" FOREIGN KEY ("baseModelTypeId") REFERENCES "BaseModelType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ModelVersion" ("createdAt", "id", "modelId", "name", "nsfwLevel", "publishedAt", "updatedAt") SELECT "createdAt", "id", "modelId", "name", "nsfwLevel", "publishedAt", "updatedAt" FROM "ModelVersion";
DROP TABLE "ModelVersion";
ALTER TABLE "new_ModelVersion" RENAME TO "ModelVersion";
CREATE INDEX "ModelVersion_modelId_name_baseModelId_baseModelTypeId_publishedAt_nsfwLevel_idx" ON "ModelVersion"("modelId", "name", "baseModelId", "baseModelTypeId", "publishedAt", "nsfwLevel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Creator_username_idx" ON "Creator"("username");

-- CreateIndex
CREATE INDEX "ModelType_name_idx" ON "ModelType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BaseModel_name_key" ON "BaseModel"("name");

-- CreateIndex
CREATE INDEX "BaseModel_name_idx" ON "BaseModel"("name");

-- CreateIndex
CREATE INDEX "BaseModelType_name_baseModelId_idx" ON "BaseModelType"("name", "baseModelId");
