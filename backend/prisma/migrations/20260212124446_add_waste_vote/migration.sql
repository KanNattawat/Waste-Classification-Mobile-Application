-- AlterTable
ALTER TABLE "Waste" ALTER COLUMN "Vote_wastetype" SET DEFAULT ARRAY[0, 0, 0, 0]::INTEGER[];

-- CreateTable
CREATE TABLE "WasteVote" (
    "Vote_ID" SERIAL NOT NULL,
    "Waste_ID" INTEGER NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Vote_Detail" TEXT NOT NULL,

    CONSTRAINT "WasteVote_pkey" PRIMARY KEY ("Vote_ID")
);

-- AddForeignKey
ALTER TABLE "WasteVote" ADD CONSTRAINT "WasteVote_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WasteVote" ADD CONSTRAINT "WasteVote_Waste_ID_fkey" FOREIGN KEY ("Waste_ID") REFERENCES "Waste"("Waste_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
