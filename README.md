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
* [`addListener(string, ...)`](#addlistenerstring-)
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
close(options: { hash_id?: string; }) => Promise<void>
```

关闭指定的HTTP流式连接

| Param         | Type                               | Description   |
| ------------- | ---------------------------------- | ------------- |
| **`options`** | <code>{ hash_id?: string; }</code> | 包含要关闭的连接的哈希ID |

**Since:** 1.0.0

--------------------


### addListener(string, ...)

```typescript
addListener(eventName: string, callback: (data: any) => void) => Promise<PluginListenerHandle>
```

添加事件监听器以接收流式传输事件

| Param           | Type                                | Description |
| --------------- | ----------------------------------- | ----------- |
| **`eventName`** | <code>string</code>                 | 要监听的事件名称    |
| **`callback`**  | <code>(data: any) =&gt; void</code> | 事件回调函数      |

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

</docgen-api>
