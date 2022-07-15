<template>
  <el-space direction="vertical" size="large" fill class="w-full">
    <el-card>
      <div id="main"></div>
    </el-card>
    <el-card>
      <el-table
        ref="tableRef"
        row-key="id"
        :data="tableData"
        border
        show-summary
        height="calc(100vh - 515px)"
        sum-text="总计杜卡德"
        :summary-method="onSum"
        @selection-change="onSelect"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column resizable label="物品" min-width="300" prop="cn" />
        <el-table-column resizable label="杜卡德" prop="ducats" sortable />
        <el-table-column resizable label="数量" prop="number" />
        <el-table-column resizable label="top1" sortable :sort-method="sort">
          <template #default="scope">
            <div v-if="scope.row.top1.platinum">
              {{
                scope.row.top1.platinum +
                "白金*" +
                scope.row.top1.quantity +
                "个"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column resizable label="top2" sortable :sort-method="sort">
          <template #default="scope">
            <div v-if="scope.row.top2.platinum">
              {{
                scope.row.top2.platinum +
                "白金*" +
                scope.row.top2.quantity +
                "个"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column resizable label="top3" sortable :sort-method="sort">
          <template #default="scope">
            <div v-if="scope.row.top3.platinum">
              {{
                scope.row.top3.platinum +
                "白金*" +
                scope.row.top3.quantity +
                "个"
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column resizable label="top4" sortable :sort-method="sort">
          <template #default="scope">
            <div v-if="scope.row.top4.platinum">
              {{
                scope.row.top4.platinum +
                "白金*" +
                scope.row.top4.quantity +
                "个"
              }}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-space>
</template>

<script setup>
import * as echarts from "echarts";

const router = useRouter();
const route = useRoute();
let tableData = reactive([]);
let myChart;

try {
  tableData = reactive(JSON.parse(route.query.data));
} catch (error) {
  router.push("/");
}

function getItem(url) {
  return new Promise((resolve) => {
    fetch("http://127.0.0.1:3080?name=" + url, {
      method: "POST",
    })
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        let res = JSON.parse(data);
        if (res.error) {
          resolve({});
          return;
        }
        let name = "";
        let ducats = "";
        let { id, items_in_set: items } = res.include.item;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (id == item.id) {
            name = item["zh-hans"].item_name;
            ducats = item.ducats;
          }
        }

        let money = {};

        let _order = res.payload.orders;
        let orders = [];
        for (let i = 0; i < _order.length; i++) {
          const item = _order[i];
          if (item.order_type === "sell" && item.visible) {
            let { last_update, platinum, quantity } = item;
            if (platinum) {
              if (!(platinum in money)) {
                money[platinum] = 0;
              }
              money[platinum] += quantity;
            }
            orders.push([last_update, platinum, quantity]);
          }
        }

        let moneys = Object.keys(money).map((key) => {
          return {
            platinum: key - 0,
            quantity: money[key],
          };
        });

        moneys.sort((a, b) => {
          if (a.platinum < b.platinum) {
            return -1;
          }
          if (a.platinum > b.platinum) {
            return 1;
          }
          return 0;
        });

        orders.sort((a, b) => {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
          return 0;
        });

        myChart.setOption({
          series: [
            {
              id: url,
              name,
              data: orders,
              type: "line",
              clip: false,
            },
          ],
        });
        resolve({ ducats, moneys });
      });
  });
}

onMounted(() => {
  myChart = echarts.init(document.getElementById("main"), null, {
    useDirtyRect: true,
  });

  myChart.setOption({
    legend: {
      show: false,
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        filterMode: "none",
        start: 85,
      },
      {
        type: "slider",
        show: true,
        yAxisIndex: [0],
        startValue: 20,
      },
      {
        type: "inside",
        filterMode: "none",
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (items) {
        let html = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          let time = `${item.axisValueLabel}<br />`;
          if (html[0] !== time) {
            html.push(time);
          }
          html.push(
            `${item.marker}${item.seriesName}【${item.data[1]}】*${item.data[2]}<br />`
          );
        }
        return html.join("");
      },
    },
    xAxis: {
      type: "time",
    },
    yAxis: {
      name: "白金",
      type: "value",
    },
    series: [
      {
        id: "platinum",
        type: "line",
        markLine: {
          silent: true,
          lineStyle: {
            color: "#333",
          },
          data: [
            {
              yAxis: 20,
            },
          ],
        },
      },
    ],
  });
  getItems();
});

onUnmounted(() => {
  myChart.dispose();
});

async function getItems() {
  for (let i = 0; i < tableData.length; i++) {
    const item = tableData[i];
    let res = await getItem(item.urlName);
    item.ducats = res.ducats || 0;
    for (let j = 0; j < Math.min((res.moneys || []).length, 4); j++) {
      // const { platinum, quantity } = res.moneys[j];
      item["top" + (j + 1)] = res.moneys[j];
    }
  }
}

let sum = ref(0);
function onSum() {
  return ["", "杜卡德合计", sum.value];
}

function onSelect(data) {
  let selected = {};
  let num = 0;
  for (let i = 0; i < tableData.length; i++) {
    const x = tableData[i];
    selected[x.cn] = false;
  }
  for (let j = 0; j < data.length; j++) {
    const y = data[j];
    selected[y.cn] = tableData.includes(y);
    num += (y.ducats || 0) * (y.number || 1);
  }
  myChart.setOption({
    legend: {
      selected,
    },
  });
  sum.value = num;
}

function sort(a, b) {
  if (a.top1.platinum < b.top1.platinum) {
    return -1;
  }
  if (a.top1.platinum > b.top1.platinum) {
    return 1;
  }
  return 0;
}
</script>
<style>
#main {
  height: 40vh;
  width: 100%;
}
</style>
