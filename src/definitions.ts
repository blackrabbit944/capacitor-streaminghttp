import type { PluginListenerHandle } from '@capacitor/core';

export interface StreamingHttpPlugin {
    /**
     * 发送HTTP请求并开始流式传输响应。
     * 响应数据将通过onMessage事件监听器传递。
     *
     * @param options 请求配置选项
     * @since 1.0.0
     */
    request(options: {
        /**
         * 请求URL
         * @since 1.0.0
         */
        url: string;
        /**
         * HTTP方法，如GET、POST等
         * @since 1.0.0
         */
        method?: string;
        /**
         * 请求头
         * @since 1.0.0
         */
        headers?: { [key: string]: string };
        /**
         * 请求体数据
         * @since 1.0.0
         */
        data?: any;
        /**
         * 用于标识请求的唯一哈希ID
         * @since 1.0.0
         */
        hash_id: string;
    }): Promise<void>;

    /**
     * 关闭指定的HTTP流式连接
     *
     * @param options 包含要关闭的连接的哈希ID
     * @since 1.0.0
     */
    close(options: { hash_id?: string }): Promise<void>;

    /**
     * 添加事件监听器以接收流式传输事件
     *
     * @param eventName 要监听的事件名称
     * @param callback 事件回调函数
     * @since 1.0.0
     */
    addListener(eventName: string, callback: (data: any) => void): Promise<PluginListenerHandle>;

    /**
     * 移除所有事件监听器
     *
     * @since 1.0.0
     */
    removeAllListeners(): Promise<void>;
}

/**
 * 流式HTTP响应的事件监听器接口
 *
 * @since 1.0.0
 */
export interface StreamingHttpListeners {
    /**
     * 接收流式数据片段时触发
     *
     * @param response 包含数据和哈希ID的响应对象
     * @since 1.0.0
     */
    onMessage: (response: { data: string; hash_id: string }) => void;

    /**
     * 流式传输完成时触发
     *
     * @param response 包含完整数据和哈希ID的响应对象
     * @since 1.0.0
     */
    onComplete: (response: { data: string; hash_id: string }) => void;

    /**
     * 发生错误时触发
     *
     * @param error 包含错误信息和哈希ID的错误对象
     * @since 1.0.0
     */
    onError: (error: { message: string; hash_id: string }) => void;

    /**
     * 连接关闭时触发
     *
     * @param response 包含哈希ID的响应对象
     * @since 1.0.0
     */
    onClose: (response: { hash_id: string }) => void;

    /**
     * 连接打开时触发
     *
     * @param response 包含哈希ID的响应对象
     * @since 1.0.0
     */
    onOpen: (response: { hash_id: string }) => void;
}
