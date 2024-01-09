import { ethers } from 'ethers';
import fn from './utils/fn';
import fs from 'fs';
import path from 'path';
import prompts from './utils/prompts';
import { titanx, EVENTS } from './proj/titanx';
import { cache } from './utils/cache';


const DATA_DIR = './_outputs';

const DISTANCE_BLOCK_RANGE = 2000;


async function sync() {

  /**
   * sync block-timestamp pairs
   */
  let currentBlockNumber: number = await titanx.getCurrentBlockNumber();
  const latestBlockNumber = await titanx.getLatestBlockNumber();


  /**
   * sync events
   */
  let shouldContinue = true;
  while (shouldContinue) {
    let toBlock = currentBlockNumber + DISTANCE_BLOCK_RANGE;

    if (toBlock > latestBlockNumber) {
      toBlock = latestBlockNumber;
      shouldContinue = false;
    };

    console.log(`\n\n#${currentBlockNumber} ~ #${toBlock}`);

    // const events = await CONTRACT.queryFilter("*", currentBlockNumber, blockEnd);
    const events = await titanx.getAllEvents(currentBlockNumber, toBlock);

    // console.log(events);
    // for loop events
    let _savedBlockNumber: number = 0;
    for (let event of events) {
      if (event.blockNumber > _savedBlockNumber) {
        await titanx.syncBlock(event.blockNumber);
        _savedBlockNumber = event.blockNumber;
      }

      // console.log(event);
      // return;

      const elog: ethers.LogDescription = titanx.parseEventToLogDescription(event);

      switch (elog.fragment.name) {
        case EVENTS.EVENT_PROTOCOL_FEE_RECEVIED:
          await titanx.saveEventProtocolFeeRecevied(event);
          break;
        case EVENTS.EVENT_MINT_STARTED:
          await titanx.saveEventMintStarted(event);
          break;
        case EVENTS.EVENT_MINT_CLAIMED:
          await titanx.saveEventMintClaimed(event);
          break;
        case EVENTS.EVENT_STAKE_STARTED:
          await titanx.saveEventStakeStarted(event);
          break;
        case EVENTS.EVENT_STAKE_ENDED:
          await titanx.saveEventStakeEnded(event);
          break;
        case EVENTS.EVENT_REWARD_CLAIMED:
          await titanx.saveEventRewardClaimed(event);
          break;
        case EVENTS.EVENT_TITAN_BURNED:
          await titanx.saveEventTitanBurned(event);
          break;
        case EVENTS.EVENT_ETH_DISTRIBUTED:
          await titanx.saveEventETHDistributed(event);
          break;
        case EVENTS.EVENT_CYCLE_PAYOUT_TRIGGERED:
          await titanx.saveEventCyclePayoutTriggered(event);
          break;
        case EVENTS.EVENT_GLOBAL_DAILY_UPDATE_STATS:
          await titanx.saveEventGlobalDailyUpdateStats(event);
          break;
        case EVENTS.EVENT_TRANSFER:
          // ERC20 Transfer
          break;
        case EVENTS.EVENT_APPROVAL:
          // ERC20 Approval
          break;
        case EVENTS.EVENT_APPROVE_BURN_MINTS:
          // Sets `amount` as the allowance of `spender` over the caller's (user) mints.
          break;
        case EVENTS.EVENT_APPROVE_BURN_STAKES:
          // Sets `amount` as the allowance of `spender` over the caller's (user) stakes.
          break;
        default:
          console.log(`--------- ${elog.fragment.name} ---------`);
          break;
      }
    }

    console.log(events.length);

    titanx.setCurrentBlockNumber(currentBlockNumber);

    currentBlockNumber += DISTANCE_BLOCK_RANGE;
    // break;
  }
}

sync();
