'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { StreamingClass } from '@/lib/streaming';
import ReactMarkdown from 'react-markdown';

export default function Home() {
    const [inputValue, setInputValue] = useState<string>('你好!');
    const [result, setResult] = useState<string>('');
    const [status, setStatus] = useState<'init' | 'loading' | 'success' | 'error'>('init');

    const handleSendData = async () => {
        const streaming = new StreamingClass({
            onOpen: () => {
                setStatus('loading');
                setResult('');
            },
            onMessage: (data) => {
                console.log('收到消息:', data, typeof data);
                const jsoned = JSON.parse(data);
                setResult((prev) => prev + jsoned.content);
            },
            onComplete: () => {
                setStatus('success');
            },
            onError: () => {
                setStatus('error');
            },
            onClose: () => {
                setStatus('init');
            },
        });
        await streaming.sendMessage(inputValue);
    };

    return (
        <div className="w-2xl pt-28 max-w-full mx-auto items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-2xl font-bold mb-8 w-full text-center">StreamingHttp Example</h1>
            <div className="flex flex-col gap-4">
                <Input
                    placeholder="请输入消息"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-white"
                />
                <div className="flex justify-center w-full">
                    <Button
                        onClick={() => {
                            handleSendData();
                        }}
                    >
                        Send消息
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row flex-start gap-4">
                        <span className="text-sm text-gray-500 bg-gray-100 rounded-md inline-block px-4 font-bold py-2">
                            {status}
                        </span>
                    </div>
                    <article className="prose">
                        <ReactMarkdown>{result}</ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}
