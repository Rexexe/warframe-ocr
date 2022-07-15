<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="HomeView">
      <component :is="Component" :key="$route.name" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { ItemsService } from "./service/items_service";

let loading;
onBeforeMount(() => {
  loading = ElLoading.service({
    lock: true,
    text: "Loading",
    background: "rgba(0, 0, 0, 0.7)",
  });
});

const $itemsService = new ItemsService();
$itemsService.count().then((val) => {
  if (val == 0) {
    setDB();
  } else {
    loading.close();
  }
});

function setDB() {
  fetch("http://127.0.0.1:3080/items", {
    method: "POST",
  })
    .then(function (response) {
      return response.text();
    })
    .then(async function (data) {
      try {
        let res = JSON.parse(data);
        res = res.payload.items.map((item) => {
          return {
            id: item.id,
            urlName: item.url_name,
            cn: item.item_name,
            en: "",
            ducats: "",
          };
        });
        await $itemsService.clear();
        await $itemsService.insertItem(res);
        await $itemsService.removeBy("裂罅");
        loading.close();
      } catch (error) {
        console.log(
          "%c [ error ]-20",
          "font-size:13px; background:pink; color:#bf2c9f;",
          error
        );
      }
    });
}
</script>
<style lang="less">
.w-full,
[w-full=""] {
  width: 100%;
}
</style>
