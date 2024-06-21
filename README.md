## 模型缓存策略

> 模型采用indexedDB缓存, 初次加载后, 会将所有模型数据缓存到用户本地, 下次加载时, 会优先读取缓存, 减少网络请求次数, 如需修改模型, 则需要同步修改`.env`环境变量中的缓存版本号: `MODEL_CACHE_VERSION`

## 回放缓存策略

```js
/**
 * 部分字段解释
 * @param {number} HZ 播放频率
 * @description 播放频率, 默认60Hz, 60帧/秒
 *
 * @param {number} DUMP_MS 一帧播放时长 单位: 毫秒
 * @description 一帧播放时长, 1000 / HZ = DUMP_MS
 *
 * @param {number} max_buffer_time 最大缓冲时间 单位: 秒
 * @description 限制单次读取缓存的数量, 避免本地缓存过大, 占用内存, 读取数据计算: data_count = max_buffer_time * HZ
 */
```

> ### 缓存策略
>
> 采用indexedDB缓存, 本地上传/远程下载回放文件时, 会进行按帧合并数据后将帧作为`key`, 合并数据作为`value`缓存到本地, 播放时按`max_buffer_time`读取缓存, 当本地数据小于缓存数量时, 则继续按帧向后读取一批数据

> ### 回放策略
>
> 按照定义的`max_buffer_time`从缓存获取数据, 使用`setInterval(function(){}, DUMP_MS)`将每帧数据集依次发送给主线程

> <img src="./public/回放策略.png" style="background: #fff; width: 100%"/>
