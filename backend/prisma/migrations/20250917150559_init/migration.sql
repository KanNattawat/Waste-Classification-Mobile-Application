-- CreateTable
CREATE TABLE "public"."User" (
    "User_ID" SERIAL NOT NULL,
    "User_email" TEXT NOT NULL,
    "User_name" TEXT,
    "User_password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("User_ID")
);

-- CreateTable
CREATE TABLE "public"."Image" (
    "Image_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Waste_ID" INTEGER NOT NULL,
    "Image_path" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("Image_ID")
);

-- CreateTable
CREATE TABLE "public"."Waste" (
    "Waste_ID" SERIAL NOT NULL,
    "Waste_name" TEXT NOT NULL,
    "Waste_info" TEXT NOT NULL,

    CONSTRAINT "Waste_pkey" PRIMARY KEY ("Waste_ID")
);

-- CreateTable
CREATE TABLE "public"."History" (
    "History_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Image_ID" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("History_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_User_email_key" ON "public"."User"("User_email");

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "public"."User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_Waste_ID_fkey" FOREIGN KEY ("Waste_ID") REFERENCES "public"."Waste"("Waste_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."History" ADD CONSTRAINT "History_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "public"."User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."History" ADD CONSTRAINT "History_Image_ID_fkey" FOREIGN KEY ("Image_ID") REFERENCES "public"."Image"("Image_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
