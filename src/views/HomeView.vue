<template>
  <el-space direction="vertical" size="large" fill class="w-full">
    <el-card>
      <el-upload
        class="upload-demo"
        drag
        action="http://127.0.0.1:3080"
        multiple
        :on-success="onSuccess"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件到方块或者 <em>点击上传</em></div>
      </el-upload>
    </el-card>
    <el-card>
      <el-table
        ref="tableRef"
        row-key="id"
        :data="tableData"
        border
        height="calc(100vh - 410px)"
        :row-class-name="rowClassName"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="isSelectable"
        />
        <el-table-column resizable label="识别区域" min-width="380">
          <template #default="scope">
            <div v-if="scope.row.url" :style="backStyle(scope)"></div>
            <div v-else>手动添加</div>
          </template>
        </el-table-column>
        <el-table-column
          resizable
          label="识别结果"
          min-width="360"
          :filters="[
            { text: '不可交易物品', value: '1' },
            { text: '非Prime的可交易物品', value: '2' },
            { text: 'Prime物品', value: '3' },
          ]"
          :filter-method="filterMethod"
        >
          <template #default="scope">
            <template v-if="scope.row.edit">
              <el-select
                class="select"
                v-model="scope.row._select"
                filterable
                remote
                value-key="id"
                placeholder="未选择"
                :remote-method="remoteMethod"
                :loading="selectLoading"
              >
                <el-option
                  v-for="item in options"
                  :key="item.id"
                  :label="item.cn"
                  :value="item"
                />
              </el-select>
            </template>
            <div v-else>{{ scope.row.cn }}</div>
          </template>
        </el-table-column>
        <el-table-column resizable label="数量" prop="number" min-width="150">
          <template #default="scope">
            <el-input-number
              style="width: 130px"
              v-if="scope.row.edit"
              v-model="scope.row._number"
              :min="1"
              :value-on-clear="1"
            />
            <div v-else>{{ scope.row.number }}</div>
          </template>
        </el-table-column>
        <el-table-column align="center" width="150">
          <template #header>
            <el-select
              v-model="newItem"
              filterable
              remote
              value-key="id"
              placeholder="手动添加物品"
              :remote-method="remoteMethod"
              :loading="selectLoading"
              @change="onNewSelect"
            >
              <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.cn"
                :value="item"
              />
            </el-select>
          </template>
          <template #default="scope">
            <el-button-group v-if="scope.row.edit">
              <el-button
                size="small"
                type="primary"
                plain
                @click="onSelectConfirm(scope)"
                >确定
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="scope.row.edit = false"
                >取消
              </el-button>
            </el-button-group>
            <el-button-group v-else>
              <el-button size="small" type="primary" @click="onEditclick(scope)"
                >编辑
              </el-button>
              <el-button size="small" type="danger" @click="onDel(scope)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card style="text-align: right">
      <el-button type="primary" @click="toNext">下一步</el-button>
    </el-card>
  </el-space>
</template>

<script>
export default {
  name: "HomeView",
};
</script>
<script setup>
import { ItemsService } from "../service/items_service";

const $itemsService = new ItemsService();

let fileList = reactive([]);
let tableData = reactive([]);
let selectLoading = ref(false);
let options = ref([]);
let newItem = ref("");
const tableRef = ref(null);

var onSuccess = (response, uploadFile) => {
  //上传成功
  if (response.code == 100) {
    let url = getUrl(uploadFile.raw);
    for (let i = 0; i < response.data.length; i++) {
      const item = response.data[i];
      findPrime(item.text).then((val) => {
        if (val) {
          tableData.push({
            box: item.box,
            ...val,
            url,
            edit: false,
            _select: val.cn,
            _number: 1,
            top1: {},
            top2: {},
            top3: {},
            top4: {},
          });
        }
      });
    }
  }
};

const onNewSelect = (val) => {
  if (val) {
    newItem.value = "";
    tableData.push({
      box: "",
      error: false,
      number: 1,
      cn: val.cn,
      id: guid(),
      url: "",
      urlName: val.urlName,
      edit: false,
      _select: val,
      _number: 1,
      top1: {},
      top2: {},
      top3: {},
      top4: {},
    });
  }
};

const filterMethod = (value, row) => {
  switch (value) {
    case "1": //不可交易
      return !!row.error;
    case "2": //非P可交易
      return !row.error && !row.cn.toLowerCase().includes("prime");
    case "3": //P
      return row.cn.toLowerCase().includes("prime");
  }
};

const onDel = ({ $index, row }) => {
  ElMessageBox.confirm(`确认删除【${row.cn}】吗`, "警告", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      tableData.splice($index, 1);
    })
    .catch(() => {});
};

const remoteMethod = (query) => {
  if (query) {
    selectLoading.value = true;
    $itemsService.getItemLike(query).then((res) => {
      options.value = res;
      selectLoading.value = false;
    });
    // setTimeout(() => {
    //   let filter = allItems.filter((item) => {
    //     return item.cn.toLowerCase().includes(query.toLowerCase());
    //   });

    //   options.value = filter.splice(0, 10);
    //   selectLoading.value = false;
    // }, 100);
  } else {
    options.value = [];
  }
};

const onSelectConfirm = ({ row }) => {
  if (typeof row._select !== "string") {
    row.id = row._select.id;
    row.urlName = row._select.urlName;
    row.cn = row._select.cn;
    row.error = false;
  }
  row.number = row._number;
  row.edit = false;
};

const isSelectable = (row) => !row.error;

function onEditclick({ row }) {
  row._select = row.cn;
  row._number = row.number;
  row.edit = true;
}

function getUrl(fileObj) {
  let url = null;
  if (window.createObjcectURL != undefined) {
    url = window.createOjcectURL(fileObj);
  } else if (window.URL != undefined) {
    url = window.URL.createObjectURL(fileObj);
  } else if (window.webkitURL != undefined) {
    url = window.webkitURL.createObjectURL(fileObj);
  }
  return url;
}
function rowClassName({ row }) {
  if (row.error === undefined) {
    return "";
  } else if (row.error) {
    return "error-row";
  } else {
    return "edit-row";
  }
}

function findPrime(text) {
  // 去除空格以及特殊字符
  let pattern = new RegExp(
    "[\\s`~!@#$^*()=|{}':;',\\[\\].<>/?~！@#￥……*（）——|{}【】‘；：”“'。，、？]",
    "g"
  );
  let txt = text.replace(pattern, "");

  //去除空格以及特殊字符后全是数字的直接返回
  if (txt.replace(/\d/g, "") == "") {
    return Promise.resolve(false);
  }

  // 匹配个数
  let matchTxt = txt.match(/(\d+)[Xx×]/);
  // 初始个数为1
  let number = 1;
  // 个数匹配成功
  if (matchTxt) {
    // 获取个数
    number = matchTxt[1] - 0;
    // 删除字符串个数部分
    txt = txt.replace(/\d+[Xx×]/, "");
  }

  let result = txt.replace(/(体|元|统|甲|翼)蓝图/, "$1").toLowerCase();

  return $itemsService.getItemLike(result).then((res) => {
    for (let i = 0; i < res.length; i++) {
      const _cn = res[i].cn.replace(/\s/g, "").toLowerCase();
      if (_cn === result) {
        return {
          number,
          ...res[i],
          error: undefined,
        };
      }
    }

    return {
      error: true,
      number,
      cn: txt,
      id: guid(),
    };
  });
}

function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return S4() + "-" + S4() + "-" + S4();
}

function backStyle({ row }) {
  let { url, box } = row;
  return {
    backgroundImage: `url(${url})`,
    backgroundPositionX: `-${box[0]}px`,
    backgroundPositionY: `-${box[1]}px`,
    height: `calc(${box[7]}px - ${box[1]}px)`,
    width: `calc(${box[2]}px - ${box[0]}px)`,
  };
}

const router = useRouter();
function toNext() {
  let data = tableRef.value.getSelectionRows();
  router.push({ name: "items", query: { data: JSON.stringify(data) } });
}
</script>

<style lang="less">
.el-upload-list__item.is-success {
  position: absolute;
  opacity: 0;
  visibility: hidden;
}
.error-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-7);
}
.edit-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-7);
}
.select {
  min-width: 250px;
  margin-right: 10px;
}
</style>
