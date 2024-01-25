import fs from "fs";
import {DATA_DIR} from "./constants.mjs";


export function createPromise() {
  const promiseObject = {};
  promiseObject.promise = new Promise<T>((resolve, reject) => {
    promiseObject.resolve = resolve;
    promiseObject.reject = reject;
  });

  return promiseObject;
}

export async function writeJSONFile(fileName, data) {
    const filePath = `${DATA_DIR}/${fileName}`;
    fs.writeFile(filePath, JSON.stringify(data, null, 2), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + filePath);
        }
    })
}