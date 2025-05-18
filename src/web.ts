import { WebPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import type { StreamingHttpPlugin } from './definitions';

export class StreamingHttpWeb extends WebPlugin implements StreamingHttpPlugin {
    private controllers: Map<string, AbortController> = new Map();

    private eventName(event: string, hashId: string): string {
        return `request_${hashId}_${event}`;
    }

    async request(options: {
        url: string;
        method?: string;
        headers?: { [key: string]: string };
        data?: any;
        hash_id: string;
    }): Promise<void> {
        console.log('[StreamingHttp plugin]request:', options);
        const { url, method, headers, data, hash_id } = options;

        try {
            // 如果存在相同hash_id的请求，先中断
            if (this.controllers.has(hash_id)) {
                this.controllers.get(hash_id)?.abort();
            }

            const controller = new AbortController();
            this.controllers.set(hash_id, controller);

            const urlObj = new URL(url);

            // 处理 GET 请求的查询参数
            if (method === 'GET' && data) {
                Object.entries(data).forEach(([key, value]) => {
                    urlObj.searchParams.append(key, String(value));
                });
            }

            let body = undefined;
            if (method !== 'GET' && data) {
                if (typeof data === 'string') {
                    body = data;
                } else {
                    body = JSON.stringify(data);
                }
            }

            let totalText = '';
            await fetchEventSource(urlObj.toString(), {
                method: method || 'GET',
                headers: {
                    ...headers,
                    Accept: 'text/event-stream',
                },
                body: body,
                signal: controller.signal,
                onopen: async (response) => {
                    console.log('[StreamingHttp plugin]onopen:', response);
                    this.notifyListeners(this.eventName('onOpen', hash_id), {});

                    //如果失败了，则抛出错误
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                },

                onmessage: (event) => {
                    const data = event.data;
                    console.log('[StreamingHttp plugin]received chunk:', data);

                    if (data === '[DONE]') {
                        console.log('[StreamingHttp plugin]: onComplete:', data, hash_id);
                        this.notifyListeners(this.eventName('onComplete', hash_id), {
                            data: totalText,
                        });
                    } else {
                        console.log('[StreamingHttp plugin]: onMessage:', data, hash_id);
                        const jsoned = JSON.parse(data);
                        if (jsoned.content) {
                            totalText += jsoned.content;
                        }
                        this.notifyListeners(this.eventName('onMessage', hash_id), {
                            data: data,
                            totalText: totalText,
                        });
                    }
                },

                onclose: () => {
                    console.log('[StreamingHttp plugin]connection closed');
                    this.notifyListeners(this.eventName('onClose', hash_id), {});

                    // 如果连接关闭了，则删除对应的 controller
                    this.controllers.delete(hash_id);
                },

                onerror: (err) => {
                    console.error('[StreamingHttp plugin] error:', err);
                    this.notifyListeners(this.eventName('onError', hash_id), {
                        message: err instanceof Error ? err.message : 'Unknown error',
                    });
                    throw err; // 允许 fetchEventSource 内部的重试机制处理
                },

                // 即使应用在后台运行，也保持连接
                openWhenHidden: true,
            });

            return Promise.resolve();
        } catch (error) {
            console.error('[StreamingHttp plugin] error:', error);
            this.notifyListeners(this.eventName('onError', hash_id), {
                message: error instanceof Error ? error.message : 'Unknown error',
            });
            return Promise.reject(error);
        }
    }

    async close(options: { hash_id?: string }): Promise<void> {
        const { hash_id } = options;
        if (hash_id) {
            // 关闭特定请求
            const controller = this.controllers.get(hash_id);
            if (controller) {
                controller.abort();
                this.controllers.delete(hash_id);
            }
        } else {
            // 关闭所有请求
            this.controllers.forEach((controller) => controller.abort());
            this.controllers.clear();
        }
        return Promise.resolve();
    }

    async addListener(
        eventName: string,
        callback: (data: unknown) => void,
    ): Promise<PluginListenerHandle> {
        console.log('[StreamingHttp plugin]addListener:', eventName, callback);
        return super.addListener(eventName, callback);
    }

    async removeAllListeners(): Promise<void> {
        console.log('[StreamingHttp plugin]removeAllListeners');
        return super.removeAllListeners();
    }
}
