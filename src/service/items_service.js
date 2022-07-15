import { connection } from "./jsstore_con";

export class ItemsService {
  constructor() {
    this.tableName = "AllItems";
  }

  getItemLike(cn) {
    let regex = new RegExp(".*" + cn.split("").join(".*") + ".*", "i");
    return connection.select({
      from: this.tableName,
      limit: 15,
      where: {
        cn: {
          regex,
        },
      },
    });
  }

  getItem(cn) {
    return connection.select({
      from: this.tableName,
      limit: 15,
      where: {
        cn,
      },
    });
  }

  count(item) {
    return connection.count({
      from: this.tableName,
      where: item,
    });
  }

  insertItem(data) {
    return connection.insert({
      into: this.tableName,
      values: data,
      skipDataCheck: true,
    });
  }

  updateItemById(item) {
    return connection.update({
      in: this.tableName,
      set: {
        ...item,
      },
      where: {
        id: item.id,
      },
    });
  }

  removeBy(cn) {
    let regex = new RegExp(".*" + cn + ".*", "i");
    return connection.remove({
      from: this.tableName,
      where: {
        cn: {
          regex,
        },
      },
    });
  }

  clear() {
    return connection.clear(this.tableName);
  }
}
