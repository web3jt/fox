-- CreateTable
CREATE TABLE "BlockTimestamp" (
    "id" INTEGER NOT NULL,
    "timestamp" INTEGER NOT NULL,

    CONSTRAINT "BlockTimestamp_pkey" PRIMARY KEY ("id")
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
    "mintedTitan" BYTEA NOT NULL,
    "mintableTitan" BYTEA NOT NULL,
    "mintCost" BYTEA NOT NULL,

    CONSTRAINT "EventMintStarted_pkey" PRIMARY KEY ("tRank")
);

-- CreateTable
CREATE TABLE "EventMintClaimed" (
    "id" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "rewardTitanClaimed" BYTEA NOT NULL,
    "penaltyAmount" BYTEA NOT NULL,
    "penaltySeconds" INTEGER NOT NULL,

    CONSTRAINT "EventMintClaimed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStakeStarted" (
    "id" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "userStakeId" INTEGER NOT NULL,
    "numOfDays" INTEGER NOT NULL,
    "stakeStartTs" INTEGER NOT NULL,
    "maturityTs" INTEGER NOT NULL,
    "titanAmount" BYTEA NOT NULL,
    "shares" BYTEA NOT NULL,

    CONSTRAINT "EventStakeStarted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventStakeEnded" (
    "id" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "titanAmount" BYTEA NOT NULL,
    "penaltyAmount" BYTEA NOT NULL,
    "penaltyPercentage" INTEGER NOT NULL,

    CONSTRAINT "EventStakeEnded_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRewardClaimed" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "ethAmount" BYTEA NOT NULL,

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
    "amount" BYTEA NOT NULL,

    CONSTRAINT "EventTitanBurned_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCyclePayoutTriggered" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "callerAddress" CHAR(42) NOT NULL,
    "cycleNo" INTEGER NOT NULL,
    "reward" BYTEA NOT NULL,
    "burnReward" BYTEA NOT NULL,

    CONSTRAINT "EventCyclePayoutTriggered_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGlobalDailyUpdateStats" (
    "day" INTEGER NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "mintCost" BYTEA NOT NULL,
    "shareRate" BYTEA NOT NULL,
    "mintableTitan" BYTEA NOT NULL,
    "mintPowerBonus" INTEGER NOT NULL,
    "EAABonus" INTEGER NOT NULL,

    CONSTRAINT "EventGlobalDailyUpdateStats_pkey" PRIMARY KEY ("day")
);

-- CreateTable
CREATE TABLE "EventETHDistributed" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL DEFAULT '',
    "calletAddress" CHAR(42) NOT NULL,
    "amount" BYTEA NOT NULL,

    CONSTRAINT "EventETHDistributed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventProtocolFeeRecevied" (
    "id" SERIAL NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "userAddress" CHAR(42) NOT NULL,
    "day" INTEGER NOT NULL,
    "amount" BYTEA NOT NULL,

    CONSTRAINT "EventProtocolFeeRecevied_pkey" PRIMARY KEY ("id")
);
