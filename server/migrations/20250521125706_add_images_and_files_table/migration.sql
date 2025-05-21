-- CreateTable
CREATE TABLE "ModelVersionFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sizeKB" REAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "modelVersionId" INTEGER NOT NULL,
    CONSTRAINT "ModelVersionFile_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelVersionImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "nsfwLevel" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "modelVersionId" INTEGER NOT NULL,
    CONSTRAINT "ModelVersionImage_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
