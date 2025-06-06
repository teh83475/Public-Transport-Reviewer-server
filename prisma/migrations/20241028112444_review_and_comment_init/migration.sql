-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "poster" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvote_count" INTEGER NOT NULL,
    "downvote_count" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "upvote_count" INTEGER NOT NULL,
    "downvote_count" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);
