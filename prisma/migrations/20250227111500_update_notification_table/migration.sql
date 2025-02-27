/*
  Warnings:

  - Added the required column `topicId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "topicId" TEXT;

INSERT INTO "Topic" ("id") VALUES ('default_topic_id') ON CONFLICT DO NOTHING;

UPDATE "Notification" SET "topicId" = 'default_topic_id' WHERE "topicId" IS NULL;

ALTER TABLE "Notification" ALTER COLUMN "topicId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ALTER COLUMN "topicId" SET DEFAULT 'default_topic_id';