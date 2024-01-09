/*
  Warnings:

  - The primary key for the `EventMintClaimed` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EventMintClaimed` table. All the data in the column will be lost.
  - The primary key for the `EventStakeEnded` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EventStakeEnded` table. All the data in the column will be lost.
  - The primary key for the `EventStakeStarted` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `EventStakeStarted` table. All the data in the column will be lost.
  - Added the required column `tRank` to the `EventMintClaimed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalStakeId` to the `EventStakeEnded` table without a default value. This is not possible if the table is not empty.
  - Added the required column `globalStakeId` to the `EventStakeStarted` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventMintClaimed" DROP CONSTRAINT "EventMintClaimed_pkey",
DROP COLUMN "id",
ADD COLUMN     "tRank" INTEGER NOT NULL,
ADD CONSTRAINT "EventMintClaimed_pkey" PRIMARY KEY ("tRank");

-- AlterTable
ALTER TABLE "EventStakeEnded" DROP CONSTRAINT "EventStakeEnded_pkey",
DROP COLUMN "id",
ADD COLUMN     "globalStakeId" INTEGER NOT NULL,
ADD CONSTRAINT "EventStakeEnded_pkey" PRIMARY KEY ("globalStakeId");

-- AlterTable
ALTER TABLE "EventStakeStarted" DROP CONSTRAINT "EventStakeStarted_pkey",
DROP COLUMN "id",
ADD COLUMN     "globalStakeId" INTEGER NOT NULL,
ADD CONSTRAINT "EventStakeStarted_pkey" PRIMARY KEY ("globalStakeId");
