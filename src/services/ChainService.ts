import {ApiPromise, WsProvider} from '@polkadot/api';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import '@polkadot/types-augment';
import {ChainInfoMap} from "@subwallet/chain-list";
import {CHAIN_LIST} from "../contants";
import {createPromise} from "../utils";

export class ChainService {
  private apiMap: Record<string, ApiPromise> = {};
  readyHandler = createPromise<void>();

  get isReady() {
    return this.readyHandler.promise;
  }

  public constructor(chains: string[]) {
    // Init web3 action on crypto ready
    cryptoWaitReady().then(() => {
      chains.forEach((chain) => {
        const chainInfo = ChainInfoMap[chain];

        if (chainInfo.substrateInfo) {
          const providers = Object.values(chainInfo.providers).filter((p) => p.startsWith('wss://'));

          const api = new ApiPromise({
            provider: new WsProvider(providers, 3000)
          });

          this.apiMap[chain] = api;
        }
      });

      this.readyHandler.resolve();
    }).catch(console.error);
  }

  public async disconnect() {
    try {
      await Promise.all(Object.entries(this.apiMap).map(([chain, api]) => {
        return api.disconnect();
      }));
    } catch (e) {
      console.error(e);
    }
  }

  public async getApi(chain: string) {
    const chainApi = this.apiMap[chain];
    if (!chainApi) {
      throw new Error(`Chain ${chain} is not supported`);
    }

    return await this.apiMap[chain].isReady;
  }
}

const ChainServiceImpl = new ChainService(CHAIN_LIST);
export default ChainServiceImpl;
