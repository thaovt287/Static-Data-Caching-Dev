import ChainServiceImpl from "./ChainService";
import {writeJSONFile} from "../utils";
import fetch from 'cross-fetch';

import {BN} from "@polkadot/util";

interface BifrostLiquidStakingMetaItem {
  exchangeRate: string,
  timestamp: string
}


interface BifrostLiquidStakingMeta {
  data: {
    dailySummaries: {
      nodes: BifrostLiquidStakingMetaItem[]
    }
  }
}

export class EarningCacheService {
  constructor() {
    //
  }

  async fetchEarningCache() {
    await ChainServiceImpl.isReady;

    await writeJSONFile('earning/data.json',{
      cacheTime: new Date().getTime(),
      data: {
        'DOT___liquid_staking___acala': await this.fetchAcalaEarningCache()
      }
    });
  }

  private async fetchAcalaGraphqlData() {
    // Fetch graphQL data
    const GRAPHQL_API = 'https://api.polkawallet.io/acala-liquid-staking-subql';
    const EXCHANGE_RATE_REQUEST = 'query { dailySummaries(first:30, orderBy:TIMESTAMP_DESC) {nodes { exchangeRate timestamp }}}';
    const req = await fetch(GRAPHQL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: EXCHANGE_RATE_REQUEST
        })
      });

    return await req.json();
  }

  async fetchAcalaEarningCache() {
    const _stakingMeta = await this.fetchAcalaGraphqlData();

    await ChainServiceImpl.isReady;
    const api = await ChainServiceImpl.getApi('acala');

    const [_toBondPool, _totalStakingBonded] = await Promise.all([
      api.query.homa.toBondPool(),
      api.query.homa.totalStakingBonded()
    ]);

    const stakingMeta = _stakingMeta as BifrostLiquidStakingMeta;
    const stakingMetaList = stakingMeta.data.dailySummaries.nodes;
    const latestExchangeRate = parseInt(stakingMetaList[0].exchangeRate);
    const decimals = 10 ** 10;

    const endingBalance = parseInt(stakingMetaList[0].exchangeRate);
    const beginBalance = parseInt(stakingMetaList[29].exchangeRate);

    const diff = endingBalance / beginBalance;
    const apy = diff ** (365 / 30) - 1;

    const toBondPool = new BN(_toBondPool.toString());
    const totalStakingBonded = new BN(_totalStakingBonded.toString());

    return {
      slug: 'DOT___liquid_staking___acala',
      statistic: {
        assetEarning: [
          {
            slug: 'acala-LOCAL-DOT',
            apy: apy * 100,
            exchangeRate: latestExchangeRate / decimals
          }
        ],
        unstakingPeriod: 24 * 28,
        maxCandidatePerFarmer: 1,
        maxWithdrawalRequestPerFarmer: 1,
        minJoinPool: '50000000000',
        minWithdrawal: '50000000000',
        totalApy: apy * 100,
        tvl: totalStakingBonded.add(toBondPool).toString()
      }
    };
  }
}

export const EarningCacheServiceImpl = new EarningCacheService();