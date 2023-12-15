import fn from './utils/fn';

async function main() {
  while (true) {
    await fn.getGasFeeData();
    await fn.sleep(1000);
  }
}

main();
