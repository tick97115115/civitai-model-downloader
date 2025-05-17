-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModelVersion_baseModelId_fkey" FOREIGN KEY ("baseModelId") REFERENCES "BaseModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ModelVersion_baseModelTypeId_fkey" FOREIGN KEY ("baseModelTypeId") REFERENCES "BaseModelType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ModelVersion" ("baseModelId", "baseModelTypeId", "createdAt", "id", "modelId", "name", "nsfwLevel", "publishedAt", "updatedAt") SELECT "baseModelId", "baseModelTypeId", "createdAt", "id", "modelId", "name", "nsfwLevel", "publishedAt", "updatedAt" FROM "ModelVersion";
DROP TABLE "ModelVersion";
ALTER TABLE "new_ModelVersion" RENAME TO "ModelVersion";
CREATE INDEX "ModelVersion_modelId_name_baseModelId_baseModelTypeId_publishedAt_nsfwLevel_idx" ON "ModelVersion"("modelId", "name", "baseModelId", "baseModelTypeId", "publishedAt", "nsfwLevel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
