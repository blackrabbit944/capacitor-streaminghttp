# @capacitor/streaming-http

SSE request plugin for iOS and web

## Install

```bash
npm install @capacitor/streaming-http
npx cap sync
```

## API

<docgen-index>

* [`request(...)`](#request)
* [`close(...)`](#close)
* [`addListener(keyof StreamingHttpListeners, ...)`](#addlistenerkeyof-streaminghttplisteners-)
* [`removeAllListeners()`](#removealllisteners)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### request(...)

```typescript
request(options: { url: string; method?: string | undefined; headers?: { [key: string]: string; } | undefined; data?: any; hash_id: string; }) => Promise<void>
```

发送HTTP请求并开始流式传输响应。
响应数据将通过onMessage事件监听器传递。

| Param         | Type                                                                                                              | Description |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| **`options`** | <code>{ url: string; method?: string; headers?: { [key: string]: string; }; data?: any; hash_id: string; }</code> | 请求配置选项      |

**Since:** 1.0.0

--------------------


### close(...)

```typescript
close(hash_id?: string | undefined) => Promise<void>
```

关闭指定的HTTP流式连接

| Param         | Type                | Description              |
| ------------- | ------------------- | ------------------------ |
| **`hash_id`** | <code>string</code> | 要关闭的连接的哈希ID，如果未提供则关闭所有连接 |

**Since:** 1.0.0

--------------------


### addListener(keyof StreamingHttpListeners, ...)

```typescript
addListener(eventName: keyof StreamingHttpListeners, callback: StreamingHttpListeners[keyof StreamingHttpListeners]) => Promise<PluginListenerHandle>
```

添加事件监听器以接收流式传输事件

| Param           | Type                                                                                                                                                                                                                                                                                                     | Description |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **`eventName`** | <code>keyof <a href="#streaminghttplisteners">StreamingHttpListeners</a></code>                                                                                                                                                                                                                          | 要监听的事件名称    |
| **`callback`**  | <code>((response: { data: string; hash_id: string; }) =&gt; void) \| ((response: { data: string; hash_id: string; }) =&gt; void) \| ((error: { message: string; hash_id: string; }) =&gt; void) \| ((response: { hash_id: string; }) =&gt; void) \| ((response: { hash_id: string; }) =&gt; void)</code> | 事件回调函数      |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

**Since:** 1.0.0

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

移除所有事件监听器

**Since:** 1.0.0

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### StreamingHttpListeners

流式HTTP响应的事件监听器接口

| Prop             | Type                                                                   | Description | Since |
| ---------------- | ---------------------------------------------------------------------- | ----------- | ----- |
| **`onMessage`**  | <code>(response: { data: string; hash_id: string; }) =&gt; void</code> | 接收流式数据片段时触发 | 1.0.0 |
| **`onComplete`** | <code>(response: { data: string; hash_id: string; }) =&gt; void</code> | 流式传输完成时触发   | 1.0.0 |
| **`onError`**    | <code>(error: { message: string; hash_id: string; }) =&gt; void</code> | 发生错误时触发     | 1.0.0 |
| **`onClose`**    | <code>(response: { hash_id: string; }) =&gt; void</code>               | 连接关闭时触发     | 1.0.0 |
| **`onOpen`**     | <code>(response: { hash_id: string; }) =&gt; void</code>               | 连接打开时触发     | 1.0.0 |

</docgen-api>
