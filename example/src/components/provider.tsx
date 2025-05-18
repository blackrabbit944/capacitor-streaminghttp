'use client';

import React, { createContext, useContext } from 'react';
import { StreamingHttp } from '@capacitor/streaming-http';
import { bus } from './../lib/bus';
import md5 from 'blueimp-md5';

const StreamCtx = createContext<{
    request: (
        opts: Omit<Parameters<typeof StreamingHttp.request>[0], 'hash_id'>,
        listeners: StreamingListeners,
    ) => Promise<string>;
} | null>(null);

type AnyObject = Record<string, unknown>;

interface StreamingEvent {
    hash_id: string;
    data: AnyObject | string;
}

interface StreamingListeners {
    /**
     * 接收流式数据片段时触发
     *
     * @param response 包含数据
     * @since 1.0.0
     */
    onMessage: (data: AnyObject | string) => void;
    /**
     * 流式传输完成时触发
     *
     * @param response 包含完整数据
     * @since 1.0.0
     */
    onComplete: (data: AnyObject | string) => void;
    /**
     * 发生错误时触发
     *
     * @param error 包含错误信息
     * @since 1.0.0
     */
    onError: (error: AnyObject | string) => void;
    /**
     * 连接关闭时触发
     *
     * @since 1.0.0
     */
    onClose: () => void;
    /**
     * 连接打开时触发
     *
     * @since 1.0.0
     */
    onOpen: (data: AnyObject) => void;
}

export const StreamingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getEventName = (eventName: string, hashId: string) => {
        return `${hashId}_${eventName}`;
    };

    const initStreamingHttp = async () => {
        // 1.移除所有的监听器
        await StreamingHttp.removeAllListeners();

        // 2.绑定5大事件
        await Promise.all([
            StreamingHttp.addListener('onMessage', (data: StreamingEvent) => {
                bus.emit(getEventName('onMessage', data.hash_id), data.data);
            }),
            StreamingHttp.addListener('onComplete', (data: StreamingEvent) => {
                bus.emit(getEventName('onComplete', data.hash_id), data.data);
            }),
            StreamingHttp.addListener('onOpen', (data: StreamingEvent) =>
                bus.emit(getEventName('onOpen', data.hash_id), data.data),
            ),
            StreamingHttp.addListener('onClose', (data: StreamingEvent) =>
                bus.emit(getEventName('onClose', data.hash_id), data.data),
            ),
            StreamingHttp.addListener('onError', (data: StreamingEvent) =>
                bus.emit(getEventName('onError', data.hash_id), data.data),
            ),
        ]);
    };

    React.useEffect(() => {
        initStreamingHttp();

        return () => {
            StreamingHttp.removeAllListeners();
        };
    }, []);

    const removeMittListener = (hash: string) => {
        bus.off(getEventName('onMessage', hash));
        bus.off(getEventName('onComplete', hash));
        bus.off(getEventName('onOpen', hash));
        bus.off(getEventName('onClose', hash));
        bus.off(getEventName('onError', hash));
    };

    // 2) 对外暴露 request，内部自动生成 hash
    const request = async (
        opts: Omit<Parameters<typeof StreamingHttp.request>[0], 'hash_id'>,
        listeners: StreamingListeners,
    ) => {
        const hash = md5(Date.now() + Math.random().toString());

        // 1. 绑定事件
        if (listeners.onOpen) {
            bus.on(getEventName('onOpen', hash), (data: AnyObject) => {
                listeners.onOpen(data);
            });
        }
        if (listeners.onMessage) {
            bus.on(getEventName('onMessage', hash), (data: AnyObject) => {
                listeners.onMessage(data);
            });
        }
        if (listeners.onComplete) {
            bus.on(getEventName('onComplete', hash), (data: AnyObject) => {
                listeners.onComplete(data);
            });
        }
        if (listeners.onClose) {
            bus.on(getEventName('onClose', hash), () => {
                listeners.onClose();
                removeMittListener(hash);
            });
        } else {
            bus.on(getEventName('onClose', hash), () => {
                removeMittListener(hash);
            });
        }
        if (listeners.onError) {
            bus.on(getEventName('onError', hash), (data: AnyObject) => {
                console.log('provider:onError', data);
                listeners.onError(data);
                removeMittListener(hash);
            });
        } else {
            bus.on(getEventName('onError', hash), (data: AnyObject) => {
                console.log('provider:onError', data);
                removeMittListener(hash);
            });
        }

        await StreamingHttp.request({ ...opts, hash_id: hash });
        return hash; // 返回给调用者做 key
    };

    return <StreamCtx.Provider value={{ request }}>{children}</StreamCtx.Provider>;
};

export const useStreaming = () => {
    const ctx = useContext(StreamCtx);
    if (!ctx) throw new Error('useStreaming must be inside <StreamingProvider>');
    return ctx;
};
