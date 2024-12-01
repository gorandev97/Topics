-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "dislikesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "dislikesCount" INTEGER NOT NULL DEFAULT 0;
