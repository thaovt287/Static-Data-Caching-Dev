import {fetchEarning} from "./fetch-earning.mjs";
import {checkHealthRpc} from "./export-error-rpc.js";
import {fetchPrice} from "./fetch-price.js";

const main = async () => {
  await Promise.all([
    fetchEarning(),
    checkHealthRpc(),
    fetchPrice(),
  ])
}

main().catch(console.error)