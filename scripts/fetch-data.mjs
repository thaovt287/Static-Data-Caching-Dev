import {VirtualBrowser} from "./lib/VirtualBrowser.mjs";
import {writeJSONFile} from "./lib/utils.mjs";
import oldData from "../data/earning/yield-pools.json" assert {type: "json"};

const runBrowser = async () => {
  const virtualBrowser = VirtualBrowser.getInstance();

  const page = await virtualBrowser.openPage('https://swwrc.pages.dev')
  const result = await page.evaluate(async () => {
    try {
      const koniState = window.SubWalletState;

      // Disable online cache only
      koniState.earningService.disableOnlineCacheOnly && koniState.earningService.disableOnlineCacheOnly();

      await koniState.eventService.waitChainReady;
      await koniState.chainService.enableChains(['polkadot', 'kusama', 'aleph', 'polkadex', 'ternoa', 'ternoa_alphanet', 'alephTest', 'polkadexTest', 'westend', 'kate', 'edgeware', 'creditcoin', 'vara_network', 'goldberg_testnet', 'moonbeam', 'moonriver', 'moonbase', 'turing', 'turingStaging', 'bifrost', 'bifrost_testnet', 'calamari_test', 'calamari', 'manta_network', 'astar', 'shiden', 'shibuya', 'amplitude', 'amplitude_test', 'kilt', 'kilt_peregrine', 'pendulum', 'kilt', 'kilt_peregrine', 'polkadot', 'kusama', 'westend', 'alephTest', 'aleph', 'kate', 'vara_network', 'goldberg_testnet', 'bifrost', 'bifrost_testnet', 'aleph', 'alephTest', 'ternoa', 'ternoa_alphanet', 'bifrost_dot', 'acala', 'parallel', 'moonbeam', 'interlay', 'krest_network']);
      await new Promise((resolve) => {
        setTimeout(resolve, 60000);
      });

      return await koniState.earningService.getYieldPoolInfo();
    } catch (e) {
      return [];
    }
  })

  const poolInfo = result.reduce((acc, pool) => {
    if (pool.statistic) {
      acc[pool.slug] = pool;
    }

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

  const data = await page.evaluate(async () => {
    const koniState = window.SubWalletState;
    const poolInfos = await koniState.earningService.getYieldPoolInfo();

    const promiseList = poolInfos.map((pool) => {
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            resolve([]);
        }, 60000);
      });

      const promise = (async () => {
        try {
          return await koniState.earningService.getPoolTargets(pool.slug)
        } catch (e) {
          console.error(e);

          return [];
        }
      })();

      return Promise.race([promise, timeoutPromise]).then((rs) => [pool.slug, rs]);
    });

    return await Promise.all(promiseList);
  });

  data.forEach(([slug, targets]) => {
    if (targets.length > 0) {
        writeJSONFile(`earning/targets/${slug}.json`, targets);
    }
  });

  await virtualBrowser.close();
};

const main = async () => {
  const errTimeout = setTimeout(() => {
    console.log('Timeout');
    // Close process
    process.exit(0);
  }, 180000);

  // Run browser
  await runBrowser();

  // Wait for 1 second
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  clearTimeout(errTimeout);
};

main().catch(console.error);