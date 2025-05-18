import { StreamingHttp, StreamingHttpPlugin } from '@capacitor/streaming-http';
import { PluginListenerHandle } from '@capacitor/core';
import md5 from 'blueimp-md5';

type AnyObject = Record<string, unknown>;

interface StreamingRequestOptions {
    url: string;
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
    onOpen?: (response: { hash_id: string }) => void;
    onMessage?: (data: string, totalText: string) => void;
    onComplete?: (totalText: string) => void;
    onError?: (message: string) => void;
    onClose?: (hash_id: string) => void;
}

export class StreamingService {
    private static instance: StreamingService;
    private streamingHttp: StreamingHttpPlugin;

    private constructor() {
        this.streamingHttp = StreamingHttp;
    }

    public static getInstance(): StreamingService {
        if (!this.instance) {
            this.instance = new StreamingService();
        }
        return this.instance;
    }

    // 创建请求特定事件名
    private eventName(event: string, hashId: string): string {
        return `request_${hashId}_${event}`;
    }

    public async request(options: StreamingRequestOptions): Promise<{
        hashId: string;
        cancel: () => Promise<void>;
    }> {
        // 生成唯一请求ID
        const hashId = md5(JSON.stringify(options.data) + Date.now().toString());
        const listeners: PluginListenerHandle[] = [];

        // 注册事件监听器
        const registerListener = async (
            event: string,
            callback: (data: AnyObject) => void,
        ): Promise<PluginListenerHandle> => {
            const eventName = this.eventName(event, hashId);
            const handle = await this.streamingHttp.addListener(eventName, callback);
            listeners.push(handle);
            console.log('注册事件监听器', handle);
            return handle;
        };

        // 处理开始事件
        if (options.onOpen) {
            await registerListener('onOpen', (data) => {
                options.onOpen!(data);
            });
        }

        // 处理消息事件
        if (options.onMessage) {
            await registerListener('onMessage', (data) => {
                options.onMessage!(data);
            });
        }

        // 处理完成事件
        if (options.onComplete) {
            await registerListener('complete', (data) => {
                options.onComplete!(data);
            });
        }

        // 处理错误事件
        if (options.onError) {
            await registerListener('onError', (data) => {
                options.onError!(data);
            });
        }

        // 处理关闭事件
        if (options.onClose) {
            await registerListener('onClose', (data) => {
                options.onClose!(data);
                this.cleanupListeners(listeners);
            });
        }

        // 发送请求
        await this.streamingHttp.request({
            url: options.url,
            method: options.method,
            data: options.data,
            headers: options.headers,
            hash_id: hashId,
        });

        // 返回请求ID和取消方法
        return {
            hashId,
            cancel: async () => {
                await this.streamingHttp.close(hashId);
                await this.cleanupListeners(listeners);
            },
        };
    }

    // 清理监听器
    private async cleanupListeners(listeners: PluginListenerHandle[]) {
        for (const listener of listeners) {
            await listener.remove();
        }
    }

    // 取消所有请求
    public async cancelAll() {
        await this.streamingHttp.close({});
    }
}
