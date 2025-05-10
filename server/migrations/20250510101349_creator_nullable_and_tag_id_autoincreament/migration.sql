/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "creator" TEXT,
    "type" TEXT NOT NULL,
    "nsfw" BOOLEAN NOT NULL,
    "nsfwLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Model" ("createdAt", "creator", "id", "name", "nsfw", "nsfwLevel", "type", "updatedAt") SELECT "createdAt", "creator", "id", "name", "nsfw", "nsfwLevel", "type", "updatedAt" FROM "Model";
DROP TABLE "Model";
ALTER TABLE "new_Model" RENAME TO "Model";
CREATE INDEX "Model_name_type_creator_nsfw_nsfwLevel_idx" ON "Model"("name", "type", "creator", "nsfw", "nsfwLevel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
