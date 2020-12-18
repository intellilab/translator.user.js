# translator.user.js

划词翻译，支持多个数据源：

- 有道翻译
- Bing 翻译
- Google 翻译

## 安装依赖

``` sh
$ yarn
```

## 开发

``` sh
$ yarn dev
```
然后使用暴力猴（Violentmonkey）的*跟踪本地文件变化*功能开发。

## 编译

``` sh
$ yarn build
```

## 发布

``` sh
# 升级新版本
$ yarn version --patch
```

然后通过 GitHub Action 自动发布。
