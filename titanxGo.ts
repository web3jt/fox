import { ethers } from 'ethers';
import fn from './utils/fn';
import fs from 'fs';
import path from 'path';
import prompts from './utils/prompts';
import CONTRACT_ABI from './abi/TitanX.abi.json';
import { PrismaClient, EventMintStarted } from '@prisma/client';
import moment from 'moment';

const DATA_DIR = './_outputs';
const PATH_TO_CSV = path.join(DATA_DIR, 'TitanX.csv');

const prisma = new PrismaClient();

async function main() {
  const csvContent: String[] = [`Day#,Date,New Mint Power,New Miners,New Addresses,Maturity Mint Power,Maturity Miners,Maturity Addresses,TitanX`];

  const allMintStartedEvents: EventMintStarted[] = await prisma.eventMintStarted.findMany();
  const minMintStartTsEvent = await prisma.eventMintStarted.findFirst({
    orderBy: {
      mintStartTs: 'asc',
    },
  });

  const maxMaturityTsEvent = await prisma.eventMintStarted.findFirst({
    orderBy: {
      maturityTs: 'desc',
    },
  });

  const minMintStartTsTs = minMintStartTsEvent.mintStartTs;
  const maxMaturityTs = maxMaturityTsEvent.maturityTs;

  let startDay = moment.unix(minMintStartTsTs).utc().startOf('day');

  let dayCount = 0;

  while (true) {
    const oneDayLater = startDay.clone().add(1, 'day');
    const startTs = startDay.unix();
    const endTs = oneDayLater.unix();

    // sum mintableTitan
    let sumNewMinterCount = BigInt(0);
    let sumNewMintPower = BigInt(0);
    let sumMaturityMinterCount = BigInt(0);
    let sumMaturityMintPower = BigInt(0);
    let sumMintableTitan = BigInt(0);
    let newAddressess: String[] = [];
    let maturityAddressess: String[] = [];

    for (const event of allMintStartedEvents) {
      // new
      if (event.mintStartTs >= startTs && event.mintStartTs < endTs) {
        sumNewMinterCount += BigInt(1);
        if (!newAddressess.includes(event.userAddress)) {
          newAddressess.push(event.userAddress);
        }
        sumNewMintPower += BigInt(event.mintPower);

      }

      // maturity
      if (event.maturityTs >= startTs && event.maturityTs < endTs) {
        sumMaturityMinterCount += BigInt(1);
        if (!maturityAddressess.includes(event.userAddress)) {
          maturityAddressess.push(event.userAddress);
        }
        sumMaturityMintPower += BigInt(event.mintPower);

        sumMintableTitan += BigInt(`0x${event.mintableTitan.toString('hex')}`);
      }
    }

    const tConsole: String[] = [];
    const tCsvLine: String[] = [];

    tConsole.push(dayCount.toString().padStart(3, ' '));
    tCsvLine.push(dayCount.toString());

    tConsole.push(startDay.format('YYYY-MM-DD'));
    tCsvLine.push(startDay.format('YYYY-MM-DD'));

    tConsole.push(sumNewMintPower.toString().padStart(10, ' '));
    tCsvLine.push(sumNewMintPower.toString());

    tConsole.push(sumNewMinterCount.toString().padStart(5, ' '));
    tCsvLine.push(sumNewMinterCount.toString());

    tConsole.push(newAddressess.length.toString().padStart(5, ' '));
    tCsvLine.push(newAddressess.length.toString());

    tConsole.push(sumMaturityMintPower.toString().padStart(10, ' '));
    tCsvLine.push(sumMaturityMintPower.toString());

    tConsole.push(sumMaturityMinterCount.toString().padStart(5, ' '));
    tCsvLine.push(sumMaturityMinterCount.toString());

    tConsole.push(maturityAddressess.length.toString().padStart(5, ' '));
    tCsvLine.push(maturityAddressess.length.toString());

    tConsole.push(`${sumMintableTitan / BigInt(`1000000000000000000`)}`.padStart(12, ' '));
    tCsvLine.push(`${sumMintableTitan / BigInt(`1000000000000000000`)}`);


    console.log(tConsole.join(' '));
    csvContent.push(tCsvLine.join(','));

    if (endTs > maxMaturityTs) {
      break;
    }
    startDay = oneDayLater;
    dayCount++;
  }

  // save csv
  fs.writeFileSync(PATH_TO_CSV, csvContent.join('\n'));


  // const allEventMintStartedData: EventMintStarted[] = await prisma.eventMintStarted.findMany();

  // for (const event of allEventMintStartedData) {
  //   // const t: String[] = [];
  //   // t.push();
  //   // console.log();

  //   const m = moment.unix(event.maturityTs);
  //   const ts = m.utc().format('YYYY-MM-DD');

  //   console.log(event);
  // }

  prisma.$disconnect();
}

main();
