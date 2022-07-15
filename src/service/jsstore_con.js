import { Connection } from "jsstore";

export const connection = new Connection(
  new Worker(new URL(`jsstore/dist/jsstore.worker.min.js`, import.meta.url))
);

connection.logStatus = false;
