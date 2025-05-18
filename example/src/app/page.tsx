'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useStreaming } from '@/components/provider';

export default function Home() {
    const [inputValue, setInputValue] = useState<string>('你好!');
    const [result, setResult] = useState<string>('');
    const [status, setStatus] = useState<'init' | 'loading' | 'success' | 'error'>('init');
    const { request } = useStreaming();

    const handleSendData = async () => {
        // 如果有正在进行的请求，先取消
        // 发送新请求
        let totalText = '';
        setStatus('loading');
        setResult('');
        const hash_id = await request(
            {
                url: 'http://localhost:3001/api/v1/ai-proxy/chat',
                method: 'POST',
                data: {
                    messages: [
                        {
                            role: 'user',
                            content: inputValue,
                        },
                    ],
                },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_JWT_TOKEN,
                },
            },
            {
                onOpen: () => {
                    console.log('内部:onOpen');
                    setStatus('loading');
                    setResult('');
                },
                onMessage: (data) => {
                    console.log('内部:onMessage:', data);
                    const jsoned = JSON.parse(data as string);
                    totalText += jsoned.content;
                    setResult(totalText);
                    setStatus('loading');
                },
                onComplete: () => {
                    console.log('内部:onComplete:', totalText);
                    setStatus('success');
                },
                onError: (error) => {
                    console.error('内部:onError:', error);
                    setStatus('error');
                },
                onClose: () => {
                    console.log('内部:onClose');
                    setStatus('init');
                },
            },
        );

        console.log('发送以后拿到的hashID', hash_id);

        // 保存取消函数以便后续使用
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
                        disabled={status != 'init'}
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
