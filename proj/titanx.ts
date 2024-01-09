import { ethers } from 'ethers';
import moment from 'moment';
import {
  PrismaClient,
  Block,
  EventMintStarted,
  EventMintClaimed,
  EventStakeStarted,
  EventStakeEnded,
  EventRewardClaimed,
  EventTitanBurned,
  EventCyclePayoutTriggered,
  EventGlobalDailyUpdateStats,
  EventETHDistributed,
  EventProtocolFeeRecevied,
} from '@prisma/client';
import CONTRACT_ABI from '../abi/TitanX.abi.json';
import { cache } from '../utils/cache';
import CONFIG from '../utils/config';

const PROVIDER = new ethers.JsonRpcProvider(CONFIG.EVM_NETWORKS.ETH_MAINNET);
const CONTRACT_ADDR = '0xF19308F923582A6f7c465e5CE7a9Dc1BEC6665B1';
const CONTRACT = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, PROVIDER);
const IFACE = new ethers.Interface(CONTRACT_ABI);

const EVENT_NAME_MAX_LENGTH = 22;

export const EVENTS = {
  EVENT_PROTOCOL_FEE_RECEVIED: 'ProtocolFeeRecevied',

  EVENT_MINT_STARTED: 'MintStarted',
  EVENT_MINT_CLAIMED: 'MintClaimed',

  EVENT_STAKE_STARTED: 'StakeStarted',
  EVENT_STAKE_ENDED: 'StakeEnded',

  EVENT_REWARD_CLAIMED: 'RewardClaimed',

  EVENT_TITAN_BURNED: 'TitanBurned',

  EVENT_ETH_DISTRIBUTED: 'ETHDistributed',
  EVENT_CYCLE_PAYOUT_TRIGGERED: 'CyclePayoutTriggered',
  EVENT_GLOBAL_DAILY_UPDATE_STATS: 'GlobalDailyUpdateStats',

  EVENT_APPROVE_BURN_MINTS: 'ApproveBurnMints',
  EVENT_APPROVE_BURN_STAKES: 'ApproveBurnStakes',
  EVENT_TRANSFER: 'Transfer',
  EVENT_APPROVAL: 'Approval',
}

class TitanX {
  private _db: PrismaClient;

  constructor() {
    this._db = new PrismaClient();
  }

  parseEventToLogDescription(event_: ethers.Log | ethers.EventLog): ethers.LogDescription {
    const data = event_.data;
    const topics = event_.topics as string[];
    return IFACE.parseLog({ data, topics });
  }

  async getCurrentBlockNumber(): Promise<number> {
    // return 18447145;

    const key = 'TitanX_LATEST_BLOCK_NUMBER';
    return cache.get(key) || 18447145;
  }

  async setCurrentBlockNumber(blockNumber_: number) {
    const key = 'TitanX_LATEST_BLOCK_NUMBER';
    await cache.put(key, blockNumber_);
  }

  async getLatestBlockNumber(): Promise<number> {
    return await PROVIDER.getBlockNumber();
  }

  async getBlock(blockNumber_: number): Promise<ethers.Block> {
    const key = `ETH_BLOCK_${blockNumber_}`;

    const cachedBlock: ethers.Block = await cache.get(key);
    if (cachedBlock) {
      return cachedBlock;
    }

    const block = await PROVIDER.getBlock(blockNumber_);

    await cache.put(key, block);

    return block;
  }

  async getAllEvents(start_: number, end_: number): Promise<(ethers.Log | ethers.EventLog)[]> {
    const key = `TitanX_EVENTS_${start_}_${end_}`;

    const cachedEvents: (ethers.Log | ethers.EventLog)[] = await cache.get(key);
    if (cachedEvents) {
      return cachedEvents;
    }

    const events = await CONTRACT.queryFilter("*", start_, end_);

    await cache.put(key, events);

    return events;
  }

  async getUserStakeInfo(user_: string, stakdId_: number) {
    return await CONTRACT.getUserStakeInfo(user_, stakdId_);
  }

  // const totalSupply = await CONTRACT.totalSupply();
  // const name = await CONTRACT.name();
  // console.log('name:', name);
  // console.log('totalSupply:', totalSupply.toString());

  async syncBlock(blockNumber_: number) {
    const exists = await this._db.block.findUnique({
      where: {
        blockNumber: blockNumber_,
      },
    });
    if (exists) return;

    const block = await this.getBlock(blockNumber_);

    const dbData: Block = {
      blockNumber: blockNumber_,
      timestamp: block.timestamp,
    }

    await this._db.block.create({ data: dbData });

    console.log(`${blockNumber_}:${block.timestamp} -> ${moment.unix(block.timestamp).format('YYYY-MM-DD HH:mm:ss')}`);
  }

  getEventProtocolFeeReceviedDisplay(data_: EventProtocolFeeRecevied): String {
    const day = `Day#${data_.day}`.padStart(7, ' ');
    const amount: bigint = BigInt(data_.amount);

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_PROTOCOL_FEE_RECEVIED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(' '.repeat(78));
    t.push(`${day} _`);
    t.push(`${ethers.formatEther(amount)} ETH`);
    return t.join(' ');
  }

  async saveEventProtocolFeeRecevied(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = titanx.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const day: bigint = elog.args.day;
    const amount: bigint = elog.args.amount;

    const exists = await this._db.eventProtocolFeeRecevied.findFirst({
      where: {
        blockNumber: Number(blockNumber),
        transactionHash: transactionHash,
        userAddress: userAddress,
        day: Number(day),
        amount: amount.toString(),
      },
    });
    if (exists) {
      const display: String = this.getEventProtocolFeeReceviedDisplay(exists);
      console.log(`- ${display}`);
      // console.error(`- ${blockNumber}:${EVENTS.EVENT_PROTOCOL_FEE_RECEVIED.padStart(EVENT_NAME_MAX_LENGTH, '_')} #${exists.id} _ ${transactionHash} _ Day#${day} _ ${ethers.formatEther(amount)} ETH`);
      return;
    }

    const dbData: EventProtocolFeeRecevied = {
      id: undefined,
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      day: Number(day),
      amount: amount.toString(),
    }

    const newEvent = await this._db.eventProtocolFeeRecevied.create({ data: dbData });
    console.log(this.getEventProtocolFeeReceviedDisplay(newEvent));
  }

  getEventMintStartedDisplay(data_: EventMintStarted): String {
    const tRank = `#${data_.tRank}`.padStart(6, ' ');
    const mintPower = `${data_.mintPower}`.padStart(3, ' ');
    const gMintPower = `${data_.gMintPower}`.padStart(5, ' ');
    const numOfDays = `${data_.numOfDays}`.padStart(3, ' ');
    const mintedTitan = BigInt(data_.mintedTitan) / BigInt(1e18);
    const mintableTitan = BigInt(data_.mintableTitan) / BigInt(1e18);
    const mintCost = ethers.formatEther(BigInt(data_.mintCost));

    const t: string[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_MINT_STARTED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${tRank} ${numOfDays} days ${mintPower}/${gMintPower}`);
    t.push(`+ ${data_.mintPowerBonus} by ${data_.EAABonus} _`);
    t.push(`${mintedTitan}/${mintableTitan}`);
    t.push(`${mintCost} ETH`);
    return t.join(' ');
  }

  async saveEventMintStarted(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const tRank: bigint = elog.args.tRank;
    const gMintpower: bigint = elog.args.gMintpower;

    const exists = await this._db.eventMintStarted.findUnique({
      where: {
        tRank: Number(tRank),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventMintStartedDisplay(exists)}`);
      return;
    }

    const userMintInfo = elog.args.userMintInfo;

    const mintPower: bigint = userMintInfo[0];
    const numOfDays: bigint = userMintInfo[1];
    const mintableTitan: bigint = userMintInfo[2];
    const mintStartTs: bigint = userMintInfo[3];
    const maturityTs: bigint = userMintInfo[4];
    const mintPowerBonus: bigint = userMintInfo[5];
    const EAABonus: bigint = userMintInfo[6];
    const mintedTitan: bigint = userMintInfo[7];
    const mintCost: bigint = userMintInfo[8];
    // const status: bigint = userMintInfo[9];

    const dbData: EventMintStarted = {
      tRank: Number(tRank),
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      gMintPower: Number(gMintpower),
      mintPower: Number(mintPower),
      numOfDays: Number(numOfDays),
      mintStartTs: Number(mintStartTs),
      maturityTs: Number(maturityTs),
      mintPowerBonus: Number(mintPowerBonus),
      EAABonus: Number(EAABonus),
      mintedTitan: mintedTitan.toString(),
      mintableTitan: mintableTitan.toString(),
      mintCost: mintCost.toString(),
    }

    const newEvent = await this._db.eventMintStarted.create({ data: dbData });
    console.log(this.getEventMintStartedDisplay(newEvent));
  }

  getEventMintClaimedDisplay(data_: EventMintClaimed): String {
    const tRank = `#${data_.tRank}`.padStart(6, ' ');
    const rewardTitanClaimed = BigInt(data_.rewardTitanClaimed) / BigInt(1e18);
    const penaltyAmount = BigInt(data_.penaltyAmount) / BigInt(1e18);
    const penaltySeconds = data_.penaltySeconds;

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_MINT_CLAIMED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${tRank} + ${rewardTitanClaimed} _ P ${penaltySeconds}s : ${penaltyAmount}`);
    return t.join(' ');
  }

  async saveEventMintClaimed(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const tRank: bigint = elog.args.tRank;
    const rewardTitanClaimed: bigint = elog.args.rewardMinted;
    const penaltyAmount: bigint = elog.args.mintPenalty;
    const penaltySeconds: bigint = elog.args.penalty;

    const exists = await this._db.eventMintClaimed.findUnique({
      where: {
        tRank: Number(tRank),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventMintClaimedDisplay(exists)}`);
      return;
    }

    const dbData: EventMintClaimed = {
      tRank: Number(tRank),
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      rewardTitanClaimed: rewardTitanClaimed.toString(),
      penaltyAmount: penaltyAmount.toString(),
      penaltySeconds: Number(penaltySeconds),
    }

    const newEvent = await this._db.eventMintClaimed.create({ data: dbData });
    console.log(this.getEventMintClaimedDisplay(newEvent));
  }

  getEventStakeStartedDisplay(data_: EventStakeStarted): String {
    const globalStakeId = `#${data_.globalStakeId}g`.padStart(5, ' ');
    const userStakeId = `#${data_.userStakeId}u`.padStart(5, ' ');
    const numOfDays = `${data_.numOfDays}`.padStart(4, ' ');
    const titanAmount = BigInt(data_.titanAmount) / BigInt(1e18);
    const shares = BigInt(data_.shares);

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_STAKE_STARTED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${globalStakeId} ${userStakeId} _`);
    t.push(`${numOfDays} days _`);
    t.push(`${titanAmount} _`);
    t.push(`shares: ${shares}`);
    return t.join(' ');
  }

  async saveEventStakeStarted(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const globalStakeId: bigint = elog.args.globalStakeId;

    const exists = await this._db.eventStakeStarted.findUnique({
      where: {
        globalStakeId: Number(globalStakeId),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventStakeStartedDisplay(exists)}`);
      return;
    }


    const userAddress: string = elog.args.user;
    const numOfDays0: bigint = elog.args.numOfDays;

    const latest = await this._db.eventStakeStarted.findFirst({
      where: {
        userAddress: userAddress,
      },
      orderBy: {
        userStakeId: 'desc'
      }
    });

    const nextUserStakeId = latest?.userStakeId + 1 || 1;
    const userStakeInfo = await titanx.getUserStakeInfo(userAddress, nextUserStakeId);

    const titanAmount: bigint = userStakeInfo.titanAmount;
    const shares: bigint = userStakeInfo.shares;
    const numOfDays1: bigint = userStakeInfo.numOfDays;
    const stakeStartTs: bigint = userStakeInfo.stakeStartTs;
    const maturityTs: bigint = userStakeInfo.maturityTs;
    const status = userStakeInfo.status;


    if (numOfDays0 !== numOfDays1) {
      console.error(`---------`);
      console.error(`ERROR: numOfDays not match: ${numOfDays0} !== ${numOfDays1}}`);
      // const t: String[] = [];
      // t.push(`${blockNumber}:${EVENTS.EVENT_STAKE_STARTED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
      // t.push(`${userAddress} -`);
      // t.push(`#${globalStakeId.toString().padStart(5, ' ')} -`);
      // t.push(`${numOfDays0.toString().padStart(4, ' ')} days (${stakeStartTs} ~ ${maturityTs}) -`);
      // t.push(`titanAmount: ${titanAmount / BigInt(1e18)}`);
      // t.push(`shares: ${shares / BigInt(1e18)}`);
      // t.push(`numOfDays: ${numOfDays1}`);
      // t.push(`status: ${status}`);
      // console.log(t.join(' '));
      console.error(`---------`);
      process.exit(0);
    }

    const dbData: EventStakeStarted = {
      globalStakeId: Number(globalStakeId),
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      userStakeId: Number(nextUserStakeId),
      numOfDays: Number(numOfDays0),
      stakeStartTs: Number(stakeStartTs),
      maturityTs: Number(maturityTs),
      titanAmount: titanAmount.toString(),
      shares: shares.toString(),
    }

    const newEvent = await this._db.eventStakeStarted.create({ data: dbData });
    console.log(this.getEventStakeStartedDisplay(newEvent));
  }

  getEventStakeEndedDisplay(data_: EventStakeEnded): String {
    const globalStakeId = `#${data_.globalStakeId}g`.padStart(5, ' ');
    const titanAmount = BigInt(data_.titanAmount) / BigInt(1e18);
    const penaltyAmount = BigInt(data_.penaltyAmount) / BigInt(1e18);
    const penaltyPercentage = `${data_.penaltyPercentage}%`.padStart(4, ' ');

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_STAKE_ENDED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${globalStakeId} _ ${titanAmount} _ ${penaltyPercentage}% ${penaltyAmount}`);
    return t.join(' ');
  }

  async saveEventStakeEnded(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const globalStakeId: bigint = elog.args.globalStakeId;
    const titanAmount: bigint = elog.args.titanAmount;
    const penaltyPercentage: bigint = elog.args.penalty;
    const penaltyAmount: bigint = elog.args.penaltyAmount;

    const exists = await this._db.eventStakeEnded.findUnique({
      where: {
        globalStakeId: Number(globalStakeId),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventStakeEndedDisplay(exists)}`);
      return;
    }

    const dbData: EventStakeEnded = {
      globalStakeId: Number(globalStakeId),
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      titanAmount: titanAmount.toString(),
      penaltyAmount: penaltyAmount.toString(),
      penaltyPercentage: Number(penaltyPercentage),
    }

    const newEvent = await this._db.eventStakeEnded.create({ data: dbData });
    console.log(this.getEventStakeEndedDisplay(newEvent));
  }

  getEventRewardClaimedDisplay(data_: EventRewardClaimed): String {
    const ethAmount = ethers.formatEther(BigInt(data_.ethAmount));

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_REWARD_CLAIMED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${ethAmount} ETH`);
    return t.join(' ');
  }


  async saveEventRewardClaimed(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const ethAmount: bigint = elog.args.reward;

    const exists = await this._db.eventRewardClaimed.findFirst({
      where: {
        blockNumber: Number(blockNumber),
        transactionHash: transactionHash,
        userAddress: userAddress,
        ethAmount: ethAmount.toString(),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventRewardClaimedDisplay(exists)}`);
      return;
    }

    const dbData: EventRewardClaimed = {
      id: undefined,
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      ethAmount: ethAmount.toString(),
    }

    const newEvent = await this._db.eventRewardClaimed.create({ data: dbData });
    console.log(this.getEventRewardClaimedDisplay(newEvent));
  }

  getEventTitanBurnedDisplay(data_: EventTitanBurned): String {
    const burnPoolCycleIndex = `Cycle#${data_.burnPoolCycleIndex}`.padStart(8, ' ');
    const amount = BigInt(data_.amount) / BigInt(1e18);
    const source = data_.source;
    const projectAddress = data_.projectAddress;

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.userAddress}:${EVENTS.EVENT_TITAN_BURNED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${burnPoolCycleIndex} _ ${amount} ...${source} => ${projectAddress}`);
    return t.join(' ');
  }

  async saveEventTitanBurned(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const userAddress: string = elog.args.user;
    const projectAddress: string = elog.args.project;
    const burnPoolCycleIndex: bigint = elog.args.burnPoolCycleIndex;
    const amount: bigint = elog.args.amount;
    const source: bigint = elog.args.titanSource;

    const exists = await this._db.eventTitanBurned.findFirst({
      where: {
        blockNumber: Number(blockNumber),
        transactionHash: transactionHash,
        userAddress: userAddress,
        projectAddress: projectAddress,
        burnPoolCycleIndex: Number(burnPoolCycleIndex),
        source: Number(source),
        amount: amount.toString(),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventTitanBurnedDisplay(exists)}`);
      return;
    }

    const dbData: EventTitanBurned = {
      id: undefined,
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      userAddress: userAddress,
      projectAddress: projectAddress,
      burnPoolCycleIndex: Number(burnPoolCycleIndex),
      source: Number(source),
      amount: amount.toString(),
    }

    const newEvent = await this._db.eventTitanBurned.create({ data: dbData });
    console.log(this.getEventTitanBurnedDisplay(newEvent));
  }

  getEventETHDistributedDisplay(data_: EventETHDistributed): String {
    const amount = ethers.formatEther(BigInt(data_.amount));

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.calletAddress}:${EVENTS.EVENT_ETH_DISTRIBUTED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`${amount} ETH`);
    return t.join(' ');
  }

  async saveEventETHDistributed(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = titanx.parseEventToLogDescription(event_);

    const calletAddress: string = elog.args.caller;
    const amount: bigint = elog.args.amount;

    const exists = await this._db.eventETHDistributed.findFirst({
      where: {
        blockNumber: Number(blockNumber),
        transactionHash: transactionHash,
        calletAddress: calletAddress,
        amount: amount.toString(),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventETHDistributedDisplay(exists)}`);
      return;
    }

    const dbData: EventETHDistributed = {
      id: undefined,
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      calletAddress: calletAddress,
      amount: amount.toString(),
    }

    const newEvent = await this._db.eventETHDistributed.create({ data: dbData });
    console.log(this.getEventETHDistributedDisplay(newEvent));
  }



  getEventCyclePayoutTriggeredDisplay(data_: EventCyclePayoutTriggered): String {
    const cycleNo = `#${data_.cycleNo}`.padStart(3, ' ');
    const reward = BigInt(data_.reward) / BigInt(1e18);
    const burnReward = BigInt(data_.burnReward) / BigInt(1e18);

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${data_.callerAddress}:${EVENTS.EVENT_CYCLE_PAYOUT_TRIGGERED.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);
    t.push(`Cycle${cycleNo} _`);
    t.push(`+ R ${reward} - B ${burnReward}`);
    return t.join(' ');
  }

  async saveEventCyclePayoutTriggered(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const callerAddress: string = elog.args.caller;
    const cycleNo: bigint = elog.args.cycleNo;
    const reward: bigint = elog.args.reward;
    const burnReward: bigint = elog.args.burnReward;

    const exists = await this._db.eventCyclePayoutTriggered.findFirst({
      where: {
        blockNumber: Number(blockNumber),
        transactionHash: transactionHash,
        callerAddress: callerAddress,
        cycleNo: Number(cycleNo),
        reward: reward.toString(),
        burnReward: burnReward.toString(),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventCyclePayoutTriggeredDisplay(exists)}`);
      return;
    }

    const dbData: EventCyclePayoutTriggered = {
      id: undefined,
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      callerAddress: callerAddress,
      cycleNo: Number(cycleNo),
      reward: reward.toString(),
      burnReward: burnReward.toString(),
    }

    const newEvent = await this._db.eventCyclePayoutTriggered.create({ data: dbData });
    console.log(this.getEventCyclePayoutTriggeredDisplay(newEvent));
  }

  getEventGlobalDailyUpdateStatsDisplay(data_: EventGlobalDailyUpdateStats): String {
    const day = `Day#${data_.day}`.padStart(7, ' ');
    const mintCost = ethers.formatEther(BigInt(data_.mintCost));
    const shareRate = BigInt(data_.shareRate);
    const mintableTitan = BigInt(data_.mintableTitan) / BigInt(1e18);
    const mintPowerBonus = data_.mintPowerBonus;
    const EAABonus = data_.EAABonus;

    const t: String[] = [];
    t.push(`${data_.blockNumber}:${data_.transactionHash}:${' '.repeat(42)}:${EVENTS.EVENT_GLOBAL_DAILY_UPDATE_STATS.padStart(EVENT_NAME_MAX_LENGTH, '_')}`);

    t.push(`${day} _`);
    t.push(`${mintCost} ETH _`);
    t.push(`shareRate: ${shareRate} _`);
    t.push(`mintableTitan: ${mintableTitan} _`);
    t.push(`${mintPowerBonus}/${EAABonus}`);
    return t.join(' ');
  }

  async saveEventGlobalDailyUpdateStats(event_: ethers.Log | ethers.EventLog) {
    const blockNumber: number = event_.blockNumber;
    const transactionHash: string = event_.transactionHash;
    const elog = this.parseEventToLogDescription(event_);

    const day: number = elog.args.day;
    const mintCost: bigint = elog.args.mintCost;
    const shareRate: bigint = elog.args.shareRate;
    const mintableTitan: bigint = elog.args.mintableTitan;
    const mintPowerBonus: bigint = elog.args.mintPowerBonus;
    const EAABonus: bigint = elog.args.EAABonus;


    const exists = await this._db.eventGlobalDailyUpdateStats.findUnique({
      where: {
        day: Number(day),
      },
    });
    if (exists) {
      console.error(`- ${this.getEventGlobalDailyUpdateStatsDisplay(exists)}`);
      return;
    }

    const dbData: EventGlobalDailyUpdateStats = {
      day: Number(day),
      blockNumber: blockNumber,
      transactionHash: transactionHash,
      mintCost: mintCost.toString(),
      shareRate: shareRate.toString(),
      mintableTitan: mintableTitan.toString(),
      mintPowerBonus: Number(mintPowerBonus),
      EAABonus: Number(EAABonus),
    }

    const newEvent = await this._db.eventGlobalDailyUpdateStats.create({ data: dbData });
    console.log(this.getEventGlobalDailyUpdateStatsDisplay(newEvent));
  }
}

export const titanx = new TitanX();
