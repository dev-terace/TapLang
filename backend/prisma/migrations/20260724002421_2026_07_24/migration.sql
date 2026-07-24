/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `MyProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MyProfile_name_key" ON "MyProfile"("name");
