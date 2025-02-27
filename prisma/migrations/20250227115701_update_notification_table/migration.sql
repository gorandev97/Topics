/*
  Warnings:

  - Added the required column `topicId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AddForeignKey
-- Clear the Notification table of data
TRUNCATE TABLE "Notification";
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "topicId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
