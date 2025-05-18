import { StreamingHttp, StreamingHttpPlugin } from '@capacitor/streaming-http';
import md5 from 'blueimp-md5';

interface StreamingListeners {
    onMessage: (data: string) => void;
    onComplete: (data: string) => void;
    onError: (message: string) => void;
    onOpen: (response: { data: string; hash_id: string }) => void;
    onClose: (response: { hash_id: string }) => void;
}

export class StreamingClass {
    private jwtToken: string;
    private streamingHttp: StreamingHttpPlugin | null;
    private isAddedListeners: boolean = false;
    private responseMap: Map<string, string> = new Map();

    public constructor(listeners: StreamingListeners) {
        this.jwtToken =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsInJvbGUiOnsiaWQiOjIsIm5hbWUiOiJVc2VyIiwiX19lbnRpdHkiOiJSb2xlIn0sImFwcF9uYW1lIjoiZmxhc2giLCJzZXNzaW9uSWQiOjEwOCwiaWF0IjoxNzQ3NDk4NTcxLCJleHAiOjE3NDgxMDMzNzF9.2IJ7bJhoyv8vPpu6cfCjmPQRz7DjLRe9C6fSYrAhgC4';
        this.streamingHttp = StreamingHttp;
        this.initializeListeners(listeners);
    }

    public async initializeListeners(listeners: StreamingListeners) {
        if (!this.streamingHttp) return;

        if (this.isAddedListeners) {
            console.log('initializeListeners:已经监听过了');
            return;
        }
        this.isAddedListeners = true;

        console.log('initializeListeners:开始监听');

        await this.streamingHttp.removeAllListeners();

        await this.streamingHttp.addListener(
            'onOpen',
            (response: { data: string; hash_id: string }) => {
                console.log('StreamingApi|onOpen:', response);
                if (listeners.onOpen) {
                    listeners.onOpen(response);
                } else {
                    console.log('StreamingApi|onOpen:没有监听onOpen');
                }
            },
        );

        await this.streamingHttp.addListener(
            'onMessage',
            (response: { data: string; hash_id: string }) => {
                console.log('StreamingApi|onMessage:', response);
                if (listeners.onMessage) {
                    listeners.onMessage(response.data);
                } else {
                    console.log('StreamingApi|onMessage:没有监听onMessage');
                }
            },
        );

        await this.streamingHttp.addListener(
            'onComplete',
            (response: { hash_id: string; data: string }) => {
                console.log('StreamingApi|onComplete:', response);
                const { hash_id } = response;
                const totalText = this.responseMap.get(hash_id) || '';
                if (listeners.onComplete) {
                    listeners.onComplete(totalText);
                } else {
                    console.log('StreamingApi|onComplete:没有监听onComplete');
                }
                this.cleanup(hash_id);
            },
        );

        await this.streamingHttp.addListener('onClose', (response: { hash_id: string }) => {
            console.log('StreamingApi|onClose:', response);
            if (listeners.onClose) {
                listeners.onClose(response);
            } else {
                console.log('StreamingApi|onClose:没有监听onClose');
            }
            this.cleanup(response.hash_id);
        });

        await this.streamingHttp.addListener(
            'onError',
            (response: { hash_id: string; message: string }) => {
                console.log('StreamingApi|onError:', response);
                const { hash_id, message } = response;
                console.error('StreamingApi|onError:', hash_id, message);
                if (listeners.onError) {
                    listeners.onError(message);
                } else {
                    console.log('StreamingApi|onError:没有监听onError');
                }
                this.cleanup(hash_id);
            },
        );
    }

    private cleanup(hash_id: string) {
        console.log('StreamingApi|cleanup:', hash_id);
        this.responseMap.delete(hash_id);
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.jwtToken,
        };
    }

    public async sendMessage(message: string) {
        const headers = this.getHeaders();
        const hash_id = md5(message);
        await StreamingHttp.request({
            url: 'http://localhost:3001/api/v1/ai-proxy/chat',
            method: 'POST',
            data: {
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
            },
            hash_id: hash_id,
            headers: headers,
        });
    }
}
