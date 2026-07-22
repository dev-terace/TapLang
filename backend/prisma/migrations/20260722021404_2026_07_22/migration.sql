-- CreateTable
CREATE TABLE "MyProfile" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "statusMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "id" SERIAL NOT NULL,
    "ownId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MyProfile_providerId_key" ON "MyProfile"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "MyProfile_email_key" ON "MyProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Friends_ownId_friendId_key" ON "Friends"("ownId", "friendId");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_ownId_fkey" FOREIGN KEY ("ownId") REFERENCES "MyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "MyProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
