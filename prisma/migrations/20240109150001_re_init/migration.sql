-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventProtocolFeeRecevied" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "EventProtocolFeeRecevied_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMintStarted" (
    "tRank" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "gMintPower" INTEGER NOT NULL,
    "mintPower" INTEGER NOT NULL,
    "numOfDays" INTEGER NOT NULL,
    "mintStartTs" INTEGER NOT NULL,
    "maturityTs" INTEGER NOT NULL,
    "mintPowerBonus" INTEGER NOT NULL,
    "EAABonus" INTEGER NOT NULL,
    "mintedTitan" TEXT NOT NULL,
    "mintableTitan" TEXT NOT NULL,
    "mintCost" TEXT NOT NULL,

    CONSTRAINT "EventMintStarted_pkey" PRIMARY KEY ("tRank")
);

-- CreateTable
CREATE TABLE "EventMintClaimed" (
    "tRank" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "rewardTitanClaimed" TEXT NOT NULL,
    "penaltyAmount" TEXT NOT NULL,
    "penaltySeconds" INTEGER NOT NULL,

    CONSTRAINT "EventMintClaimed_pkey" PRIMARY KEY ("tRank")
);

-- CreateTable
CREATE TABLE "EventStakeStarted" (
    "globalStakeId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "userStakeId" INTEGER NOT NULL,
    "numOfDays" INTEGER NOT NULL,
    "stakeStartTs" INTEGER NOT NULL,
    "maturityTs" INTEGER NOT NULL,
    "titanAmount" TEXT NOT NULL,
    "shares" TEXT NOT NULL,

    CONSTRAINT "EventStakeStarted_pkey" PRIMARY KEY ("globalStakeId")
);

-- CreateTable
CREATE TABLE "EventStakeEnded" (
    "globalStakeId" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "titanAmount" TEXT NOT NULL,
    "penaltyAmount" TEXT NOT NULL,
    "penaltyPercentage" INTEGER NOT NULL,

    CONSTRAINT "EventStakeEnded_pkey" PRIMARY KEY ("globalStakeId")
);

-- CreateTable
CREATE TABLE "EventRewardClaimed" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "ethAmount" TEXT NOT NULL,

    CONSTRAINT "EventRewardClaimed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTitanBurned" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "projectAddress" CHAR(42) NOT NULL,
    "burnPoolCycleIndex" INTEGER NOT NULL,
    "source" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "EventTitanBurned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventETHDistributed" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "calletAddress" CHAR(42) NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "EventETHDistributed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCyclePayoutTriggered" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "callerAddress" CHAR(42) NOT NULL,
    "cycleNo" INTEGER NOT NULL,
    "reward" TEXT NOT NULL,
    "burnReward" TEXT NOT NULL,

    CONSTRAINT "EventCyclePayoutTriggered_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGlobalDailyUpdateStats" (
    "day" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "mintCost" TEXT NOT NULL,
    "shareRate" TEXT NOT NULL,
    "mintableTitan" TEXT NOT NULL,
    "mintPowerBonus" INTEGER NOT NULL,
    "EAABonus" INTEGER NOT NULL,

    CONSTRAINT "EventGlobalDailyUpdateStats_pkey" PRIMARY KEY ("day")
);

-- AddForeignKey
ALTER TABLE "EventProtocolFeeRecevied" ADD CONSTRAINT "EventProtocolFeeRecevied_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMintStarted" ADD CONSTRAINT "EventMintStarted_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMintClaimed" ADD CONSTRAINT "EventMintClaimed_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStakeStarted" ADD CONSTRAINT "EventStakeStarted_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStakeEnded" ADD CONSTRAINT "EventStakeEnded_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRewardClaimed" ADD CONSTRAINT "EventRewardClaimed_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTitanBurned" ADD CONSTRAINT "EventTitanBurned_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventETHDistributed" ADD CONSTRAINT "EventETHDistributed_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCyclePayoutTriggered" ADD CONSTRAINT "EventCyclePayoutTriggered_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGlobalDailyUpdateStats" ADD CONSTRAINT "EventGlobalDailyUpdateStats_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
