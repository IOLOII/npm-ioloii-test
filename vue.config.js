const path = require("path");

module.exports = {
  // 选项...
  pages: {
    index: {
      // page 的入口
      entry: "examples/main.js",
      // 模板来源
      template: "public/index.html",
      // 在 dist/index.html 的输出
      filename: "index.html",
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: "vue html",
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ["chunk-vendors", "chunk-common", "index"],
    },
  },
  publicPath: "./", // 基本路径
  chainWebpack: (config) => {
    // vue默认@指向src目录，这里要修正为examples，另外新增一个~指向packages
    config.resolve.alias
      .set("@", path.resolve("examples"))
      .set("@packages", path.resolve("packages"));
    // lib目录是组件库最终打包好存放的地方，不需要
    // packages和examples目录需要加入编译
    config.module
      .rule("js")
      .include.add(/packages/)
      .end()
      .include.add(/examples/)
      .end()
      .use("babel")
      .loader("babel-loader")
      .tap((options) => {
        // 修改它的选项...
        return options;
      });
  },
};
