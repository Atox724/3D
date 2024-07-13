

## 0.0.1 (2024-07-13)


### ⚠ BREAKING CHANGES

* **env:** The cache implementation and environment variables have
changed, which may affect existing clients relying on the previous setup.
Clients will need to be updated to accommodate these changes.
* **cache:** The cache implementation now uses IDB instead of localforage.
This may affect existing clients relying on the previous caching mechanism.
Clients will need to be updated to accommodate this change.
* **utils:** The cache implementation replaces the previous storeName
with a new instance configured with the store name and description. Any
existing code relying on the old storeName will need to be updated to use
the new instance configuration.
* **renderer:** Any code directly importing `Stats` or `Line` classes will now
need to update the import paths to the new locations within `three.utils`.
* **renderer:** Render orders have been removed from enums and
replaced with a more streamlined approach. Update your code to
reflect these changes in topic subscriptions and rendering.
* **renderer:** The monitor utility has been removed in favor of stats. This
change will require updates to any components relying on the old monitor API.

### ✨ Features | 新功能

*  车道线 ([c9b0ea4](https://github.com/wangchao0724/3D/commit/c9b0ea45e6fb0b999ad475981a344de8d5887fc8))
*  旧接口支持 ([6ad2140](https://github.com/wangchao0724/3D/commit/6ad214046029acdcfe5f9516d1d414c5d696a27d))
*  fps echarts ([2231722](https://github.com/wangchao0724/3D/commit/22317229a875bd270658536389941e8634839f81))
*  laneline ([eef37b2](https://github.com/wangchao0724/3D/commit/eef37b2a1e7bdf7ac1deaa05a7656c5406d5d659))
*  new render ([7d8b15f](https://github.com/wangchao0724/3D/commit/7d8b15f5194841fa8b2e1106b422efe7892e8760))
*  new render ([0452b6a](https://github.com/wangchao0724/3D/commit/0452b6ace98c227066b74b7a973dbdfa5021ca2c))
*  remote replay ([68bb4ef](https://github.com/wangchao0724/3D/commit/68bb4ef0682ba1e1376bee417782fbf24c12f33e))
*  replay ([c699540](https://github.com/wangchao0724/3D/commit/c6995407da30cca6baea25e90965b132274a6140))
* **cache:** implement IDB-based cache with version control ([b54e010](https://github.com/wangchao0724/3D/commit/b54e01029c40a9ab7beda0df6fea5a1cfa589ff3))
* **env:** add HMI cache variables and update cache implementation ([1dc462e](https://github.com/wangchao0724/3D/commit/1dc462e55181d3c70b8626b7c4c2464ec6c8d2a6))
* **release-config:** initialize release-it configuration for automated releases ([fad2134](https://github.com/wangchao0724/3D/commit/fad2134aadaa4a478ad8ba850b89b1b06a98fb4e))
* **replay:** integrate ReplayerStore for unified replay logic ([f34d0ca](https://github.com/wangchao0724/3D/commit/f34d0ca570de1db1a11aab2c94dc21f1e650c3ef))
* **utils:** add localforage cache support and refactor GLTFLoader ([db8d6be](https://github.com/wangchao0724/3D/commit/db8d6bee8b3541a2d5c30bc744d2df417904a3be))
* **utils:** introduce localforage-based cache instance for GLTF models ([621f8c7](https://github.com/wangchao0724/3D/commit/621f8c76c3cc0eb51aaf0c0c23602aeb9bc01a77))


### 🐛 Bug Fixes | Bug 修复

* **components:** remove unused imports and ensure immutability in merge operations ([d9be369](https://github.com/wangchao0724/3D/commit/d9be3691578f0bbfbf5cf0ba2469d3d0776be4db))


### 📝 Documentation | 文档

* **readme:** add image for replay strategy ([e49d274](https://github.com/wangchao0724/3D/commit/e49d274cf6f8f945734ce7e0db8eccd385b764d1))
* **readme:** set image width to 100% for proper display ([85f981b](https://github.com/wangchao0724/3D/commit/85f981b2751bddef75115d0368f7df6d8e1ae4c4))


### 💄 Styles | 风格

* **controller:** adjust layout using el-space and fix router history ([2c6bdae](https://github.com/wangchao0724/3D/commit/2c6bdae068d3175ed06bef2f4674e982f7dab4f2))


### ♻️ Code Refactoring | 代码重构

*  分离基础场景 ([fb16e50](https://github.com/wangchao0724/3D/commit/fb16e501517dbdea8eef1f5ed3e9034c0c7f68d7))
*  固定定时器间隔DUMP_MS, 内部通过while来处理倍速播放 ([7642f69](https://github.com/wangchao0724/3D/commit/7642f694fa0073b7b784fb84f65b7fcae794d69d))
*  arrow ([06cd58b](https://github.com/wangchao0724/3D/commit/06cd58b5217dc6fb4e1d13d61583e29ab97ef8d8))
*  local replay ([70704d4](https://github.com/wangchao0724/3D/commit/70704d4066709bb82efe818e5dbf748594c42f05))
*  path ([70241bc](https://github.com/wangchao0724/3D/commit/70241bcdbe545d487d18676dd499cb25579e42cb))
*  render ([dcd1a60](https://github.com/wangchao0724/3D/commit/dcd1a601e65b8b9aa61df64d6be1b38e80eaf6c4))
*  render object ([4ea6db3](https://github.com/wangchao0724/3D/commit/4ea6db3e9d4041b3abb387a3f370370e78a3fc62))
*  render order ([6260c9e](https://github.com/wangchao0724/3D/commit/6260c9e0f38012e09d4473670deb32bb8dc0b8d4))
*  render分类 ([633f6cf](https://github.com/wangchao0724/3D/commit/633f6cfc66fd36619bc4eb89b303ea8a5955b71d))
*  render类的复用 ([3ceac28](https://github.com/wangchao0724/3D/commit/3ceac2867771127a33a0eaa5d366ab8d28e45e4b))
*  topic type ([71bc2f9](https://github.com/wangchao0724/3D/commit/71bc2f9cf264434e722e3df609a5750cfb0de9f6))
*  topic分类 ([f53d79f](https://github.com/wangchao0724/3D/commit/f53d79f9707c39b46b9fb5e127097766d43dafb7))
*  topic统一管理 ([1b99662](https://github.com/wangchao0724/3D/commit/1b99662facc6c0969f81dac5c0da92f0f4c3eaf3))
* **renderer:** manage render order with new RenderOrderManager ([0ecc127](https://github.com/wangchao0724/3D/commit/0ecc1275866a135b7df7506dc9e447057ea3fce8))
* **renderer:** move Stats and Line modules to three.utils ([1142b43](https://github.com/wangchao0724/3D/commit/1142b43430d7ba0f1e6933b30760a39e1f7a3ec8))
* **renderer:** optimize topic subscription and rendering logic ([4523a4c](https://github.com/wangchao0724/3D/commit/4523a4c9c56c9a4fa4acee34f3e5479374bb90c2))
* **renderer:** refactor render order management and improve polyline rendering ([b0f9109](https://github.com/wangchao0724/3D/commit/b0f910941a78a906ff27334afbb9fa79a3404f88))
* **renderer:** replace monitor with stats and improve performance tracking ([08d2e72](https://github.com/wangchao0724/3D/commit/08d2e7267debd23fa050dc109104a6e4d42e58dd))
* **renderer:** simplify render order management for polylines ([0a1c72f](https://github.com/wangchao0724/3D/commit/0a1c72f356ba026d664e6d95d0ba36cde9f8c998))
* **renderer:** update topic types and improve cylinder rendering ([ec19740](https://github.com/wangchao0724/3D/commit/ec197407559b477432d18d504bdbbf72893da17f))


### ⚡ Performance Improvements | 性能优化

*  回放控制条&Line Z ([289844b](https://github.com/wangchao0724/3D/commit/289844b0783c68ec6c60e9d380a148e9331be5b1))
*  小文件回放(占内存), 后续考虑indexDB支持大文件缓存回放 ([7c2a707](https://github.com/wangchao0724/3D/commit/7c2a707073e8c6a5f623e41c0c6c75546b76fc76))
*  页面区分工程和产品版 ([67d6fe0](https://github.com/wangchao0724/3D/commit/67d6fe0fedb82790a265393ce4b331aec4a67246))
*  指定渲染顺序 ([e2010a2](https://github.com/wangchao0724/3D/commit/e2010a263758b5da466d52f0a99fc36c69cd9bc1))
*  boxtarget ([0cb1a04](https://github.com/wangchao0724/3D/commit/0cb1a048c3d6532e22305131b772b0d97702ad1a))
*  fps chart ([4df0725](https://github.com/wangchao0724/3D/commit/4df07253d9c21934a3c8ed76b678974ac7d6f1ad))
*  jump fram ([e758ee1](https://github.com/wangchao0724/3D/commit/e758ee13f40675f59147b77ca91e96b7af236d74))
*  remote replay ([2fff6bb](https://github.com/wangchao0724/3D/commit/2fff6bb94bbae3c0260123fae523805acf6f7a94))
*  render ([ddd8279](https://github.com/wangchao0724/3D/commit/ddd827916f9fd6a09327f0e482f060656b0c59a9))
*  replay ([0ed4931](https://github.com/wangchao0724/3D/commit/0ed4931deda377384ff6ef39ce3f0ab92797210d))
