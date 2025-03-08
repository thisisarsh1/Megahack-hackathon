'use client';
import { useUserContext } from '@/app/context/Userinfo';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const Page = () => {
    const { roomName } = useParams(); // url se chat room ka name lena ........ it can be infinite rooms .. 
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const { contextemail} = useUserContext();

    const webSocketRef = useRef(null);

    useEffect(() => {
        const user = contextemail//prompt
        setUsername(user);
        console.log(roomName);

        const ws = new WebSocket(`ws://localhost:8090/ws/chat/${roomName}/`);
        webSocketRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection opened");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Message received:", data);

            if (data.type === 'chat_history') {
                //  receiving chat history
                setMessages(data.messages);
            } else {
                // receiving a single chat message
                setMessages((prev) => [...prev, data]);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        return () => ws.close();
    }, [roomName]);

    const sendMessage = () => {
        if (message.trim() && webSocketRef.current) {
            const data = {
                username,
                message,
            };
            webSocketRef.current.send(JSON.stringify(data));
            setMessage('');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 p-8 mt-20">
            <div className="max-w-4xl mx-auto bg-neutral-900/30 border border-neutral-800/50 rounded-2xl backdrop-blur-sm shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800">
                    <h2 className="text-2xl font-bold text-neutral-200">Chat Room: {roomName}</h2>
                </div>

                {/* Messages Container */}
                <div className="h-[500px] p-6 overflow-y-auto bg-neutral-900/20">
                    {messages.map((msg, index) => (
                        <div key={index} className="mb-3">
                            <div className="max-w-[85%] inline-block">
                                <div className="bg-neutral-800/50 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-neutral-300">{msg.username}</span>
                                        <span className="text-[10px] text-neutral-500">{msg.timestamp}</span>
                                    </div>
                                    <p className="text-neutral-200 text-sm">{msg.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/40">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-neutral-800/50 text-neutral-200 placeholder-neutral-500 rounded-xl px-4 py-3 border border-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                        />
                        <button 
                            onClick={sendMessage}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium"
                        >
                            Send
                        </button>
                    
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
