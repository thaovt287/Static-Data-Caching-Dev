import fs from "fs";
import {DATA_DIR} from "../contants";

export interface PromiseObject<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export function createPromise<T>(): PromiseObject<T> {
  const promiseObject = {} as PromiseObject<T>;
  promiseObject.promise = new Promise<T>((resolve, reject) => {
    promiseObject.resolve = resolve;
    promiseObject.reject = reject;
  });

  return promiseObject;
}

export async function writeJSONFile(fileName: string, data: any) {
    const filePath = `${DATA_DIR}/${fileName}`;
    fs.writeFile(filePath, JSON.stringify(data, null, 2), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + filePath);
        }
    })
}