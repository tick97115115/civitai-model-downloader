-- CreateTable
CREATE TABLE "Model" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nsfw" BOOLEAN NOT NULL,
    "nsfwLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "baseModel" TEXT NOT NULL,
    "baseModelType" TEXT,
    "publishedAt" DATETIME,
    "nsfwLevel" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ModelToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ModelToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ModelToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Model_name_type_creator_nsfw_nsfwLevel_idx" ON "Model"("name", "type", "creator", "nsfw", "nsfwLevel");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "ModelVersion_modelId_name_baseModel_baseModelType_publishedAt_nsfwLevel_idx" ON "ModelVersion"("modelId", "name", "baseModel", "baseModelType", "publishedAt", "nsfwLevel");

-- CreateIndex
CREATE UNIQUE INDEX "_ModelToTag_AB_unique" ON "_ModelToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ModelToTag_B_index" ON "_ModelToTag"("B");
