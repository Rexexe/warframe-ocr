const { defineConfig } = require("@vue/cli-service");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
const Icons = require("unplugin-icons/webpack");
const IconsResolver = require("unplugin-icons/resolver");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: "Icon",
          }),
        ],
        dts: "src/auto-import.d.ts",
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/,
          /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],
        imports: ["vue", "vue-router"],
        eslintrc: {
          enabled: true,
        },
      }),
      Components({
        resolvers: [
          IconsResolver({
            enabledCollections: ["ep"],
          }),
          ElementPlusResolver(),
        ],
        dts: "src/components.d.ts",
      }),
      Icons({
        autoInstall: true,
      }),
    ],
  },
});
