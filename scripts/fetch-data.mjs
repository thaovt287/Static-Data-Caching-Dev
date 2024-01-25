import {VirtualBrowser} from "./lib/VirtualBrowser.mjs";
import {writeJSONFile} from "./lib/utils.mjs";
import oldData from "../data/earning/yield-pools.json" assert {type: "json"};

const runBrowser = async () => {
  const virtualBrowser = VirtualBrowser.getInstance();

  const page = await virtualBrowser.openPage('https://swwrc.pages.dev')
  const result = await page.evaluate(async () => {
    try {
      const koniState = window.SubWalletState;
      await koniState.eventService.waitChainReady;
      await koniState.chainService.enableChains(['polkadot', 'kusama', 'aleph', 'polkadex', 'ternoa', 'ternoa_alphanet', 'alephTest', 'polkadexTest', 'westend', 'kate', 'edgeware', 'creditcoin', 'vara_network', 'goldberg_testnet', 'moonbeam', 'moonriver', 'moonbase', 'turing', 'turingStaging', 'bifrost', 'bifrost_testnet', 'calamari_test', 'calamari', 'manta_network', 'astar', 'shiden', 'shibuya', 'amplitude', 'amplitude_test', 'kilt', 'kilt_peregrine', 'pendulum', 'kilt', 'kilt_peregrine', 'polkadot', 'kusama', 'westend', 'alephTest', 'aleph', 'kate', 'vara_network', 'goldberg_testnet', 'bifrost', 'bifrost_testnet', 'aleph', 'alephTest', 'ternoa', 'ternoa_alphanet', 'bifrost_dot', 'acala', 'parallel', 'moonbeam', 'interlay']);
      await new Promise((resolve) => {
        setTimeout(resolve, 30000);
      });

      return await koniState.earningService.getYieldPoolInfo();
    } catch (e) {
      return [];
    }
  })

  const poolInfo = result.reduce((acc, pool) => {
    acc[pool.slug] = pool;
    return acc;
  }, {});

  const updateDate = new Date();
  await writeJSONFile('earning/yield-pools.json', {
    lastUpdated: updateDate.getTime(),
    lastUpdatedTimestamp: updateDate.toISOString(),
    data: {
      ...oldData.data,
      ...poolInfo
    }
  });

  await virtualBrowser.close();
};

const main = async () => {
  const errTimeout = setTimeout(() => {
    console.log('Timeout');
    // Close process
    process.exit(0);
  }, 90000);

  // Run browser
  await runBrowser();

  // Wait for 1 second
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  clearTimeout(errTimeout);
};

main().catch(console.error);