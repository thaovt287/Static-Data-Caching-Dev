import ChainServiceImpl from "./ChainService";
import {writeJSONFile} from "../utils";

export class EarningCacheService {
  async fetchEarningCache() {
    await ChainServiceImpl.isReady;
    await writeJSONFile('earning/data.json',{
      cacheTime: new Date().getTime(),
    });
  }
}

export const EarningCacheServiceImpl = new EarningCacheService();