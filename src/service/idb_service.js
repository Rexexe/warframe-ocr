import { connection } from "./jsstore_con";
import { DATA_TYPE } from "jsstore";

const getDatabase = () => {
  const allItems = {
    name: "AllItems",
    columns: {
      id: {
        primaryKey: true,
      },
      urlName: {
        notNull: true,
        dataType: DATA_TYPE.String,
      },
      cn: {
        notNull: true,
        dataType: DATA_TYPE.String,
      },
      en: {
        notNull: false,
        dataType: DATA_TYPE.String,
      },
      ducats: {
        notNull: false,
        dataType: DATA_TYPE.Number,
      },
    },
  };
  const dataBase = {
    name: "warframe",
    tables: [allItems],
  };
  return dataBase;
};

export const initJsStore = async () => {
  const dataBase = getDatabase();
  return await connection.initDb(dataBase);
};
