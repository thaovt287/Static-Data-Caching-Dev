import ChainServiceImpl from "./services/ChainService";
import {EarningCacheServiceImpl} from "./services/EarningCacheService";

const main = async () => {
  const errTimeout = setTimeout(() => {
    console.log('Timeout');
    // Close process
    process.exit(0);
  }, 90000);


  // Fetch earning cache
  console.log('Start fetching earning cache');
  await EarningCacheServiceImpl.fetchEarningCache();
  console.log('Finish fetching earning cache');

  // Wait for 1 second
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  // Disconnect chain service finished script
  console.log('Disconnecting chain service');
  await ChainServiceImpl.disconnect();
  clearTimeout(errTimeout);
};

main().catch(console.error);