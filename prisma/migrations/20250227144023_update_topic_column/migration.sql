-- CreateEnum
CREATE TYPE "TopicCategory" AS ENUM ('Technology', 'Entertainment', 'Science', 'Lifestyle', 'Politics', 'Business_Finance', 'Education', 'Sports', 'Art_Creativity', 'Social_Issues', 'History_Culture', 'Philosophy_Thought', 'Hobbies_Interests', 'Technology_Support', 'Miscellaneous');

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "category" "TopicCategory" NOT NULL DEFAULT 'Miscellaneous';
