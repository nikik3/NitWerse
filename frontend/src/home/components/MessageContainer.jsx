import React, { useEffect, useState, useRef } from 'react';
import userConversation from '../../Zustans/useConversation';
import { useAuth } from '../../context/AuthContext';
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocketContext } from '../../context/SocketContext';
import Avatar from './Avatar';
import notify from '../../assets/sound/notification.mp3';

const MessageContainer = ({ onBackUser }) => {
    const { messages, selectedConversation, setMessage, setSelectedConversation } = userConversation();
    const { socket } = useSocketContext();
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendData, setSnedData] = useState("");
    const lastMessageRef = useRef();

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            const convId = selectedConversation?._id?.toString();
            if (!convId) return;

            const isRelevant = selectedConversation?.isRoom
                ? newMessage.roomId?.toString() === convId
                : newMessage.senderId?.toString() === convId || newMessage.reciverId?.toString() === convId;

            if (!isRelevant) return;

            setMessage((prev) => {
                if (prev.some((m) => m._id === newMessage._id)) return prev;
                return [...prev, newMessage];
            });

            if (newMessage.senderId?.toString() !== authUser._id?.toString()) {
                const sound = new Audio(notify);
                sound.play().catch(() => {});
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedConversation, authUser._id, setMessage]);

    useEffect(() => {
        // If a room is selected, join the socket room
        if (selectedConversation?.isRoom && socket) {
            socket.emit("joinRoom", selectedConversation._id);
        }
    }, [selectedConversation, socket]);

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }, [messages]);

    useEffect(() => {
        const getMessages = async () => {
            setLoading(true);
            try {
                const roomParam = selectedConversation?.isRoom ? '?isRoom=true' : '';
                const get = await axios.get(`/api/message/${selectedConversation?._id}${roomParam}`);
                const data = await get.data;
                if (data?.success === false) {
                    toast.error(data.message || "Could not load messages");
                    setMessage([]);
                } else {
                    setMessage(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Could not load messages");
                setMessage([]);
            } finally {
                setLoading(false);
            }
        }

        if (selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, selectedConversation?.isRoom, setMessage]);

    const handelMessages = (e) => {
        setSnedData(e.target.value);
    }

    const handelSubmit = async (e) => {
        e.preventDefault();
        if (!sendData.trim()) return;
        setSending(true);
        try {
            const roomParam = selectedConversation?.isRoom ? '?isRoom=true' : '';
            const res = await axios.post(`/api/message/send/${selectedConversation?._id}${roomParam}`, { messages: sendData.trim() });
            const data = await res.data;
            if (data?.success === false) {
                toast.error(data.message || "Failed to send message");
                return;
            }
            setSnedData('');
            setMessage((prev) => {
                if (prev.some((m) => m._id === data._id)) return prev;
                return [...prev, data];
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className='w-full h-full flex flex-col'>
            {selectedConversation === null ? (
                <div className='flex items-center justify-center w-full h-full'>
                    <div className='px-4 text-center text-xl text-neutral-300 font-semibold flex flex-col items-center gap-4'>
                        <p className='text-3xl text-neutral-100'>Welcome to NitWerse, {authUser.username}! 👋</p>
                        <p className="text-lg text-neutral-400">Select a chat or join a room to start messaging</p>
                        <TiMessages className='text-7xl text-indigo-500 mt-4' />
                    </div>
                </div>
            ) : (
                <>
                    <div className='flex justify-between items-center bg-neutral-900 border-b border-neutral-800 px-4 h-16'>
                        <div className='flex gap-4 items-center'>
                            <div className='md:hidden'>
                                <button onClick={() => onBackUser(true)} className='text-neutral-400 hover:text-white transition'>
                                    <IoArrowBackSharp size={24} />
                                </button>
                            </div>
                            <div className='flex items-center gap-3'>
                                {!selectedConversation.isRoom && (
                                    <Avatar username={selectedConversation?.username || 'User'} size={40} />
                                )}
                                {selectedConversation.isRoom && (
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                                        #
                                    </div>
                                )}
                                <div>
                                    <span className='text-neutral-100 text-base font-bold block'>
                                        {selectedConversation?.username || selectedConversation?.name}
                                    </span>
                                    {selectedConversation.isRoom ? (
                                        <span className='text-xs text-indigo-400'>{selectedConversation.participants?.length || 0} member(s)</span>
                                    ) : (
                                        <span className='text-xs text-neutral-500'>Direct Message</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 overflow-auto p-4 custom-scrollbar'>
                        {loading && (
                            <div className="flex w-full h-full flex-col items-center justify-center">
                                <div className="loading loading-spinner text-indigo-500"></div>
                            </div>
                        )}
                        {!loading && messages?.length === 0 && (
                            <div className='flex items-center justify-center h-full'>
                                <p className='text-center text-neutral-500 font-medium'>Be the first to say hello!</p>
                            </div>
                        )}
                        {!loading && messages?.length > 0 && messages?.map((message) => (
                            <div className='text-white' key={message?._id} ref={lastMessageRef}>
                                <div className={`chat ${message.senderId?.toString() === authUser._id?.toString() ? 'chat-end' : 'chat-start'}`}>
                                    <div className={`chat-bubble text-sm md:text-base ${message.senderId?.toString() === authUser._id?.toString() ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                                        {message?.message}
                                    </div>
                                    <div className="chat-footer text-xs text-neutral-500 mt-1">
                                        {new Date(message?.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className='p-4 bg-neutral-900 border-t border-neutral-800'>
                        <form onSubmit={handelSubmit} className='flex gap-2 items-center'>
                            <input 
                                value={sendData} 
                                onChange={handelMessages} 
                                required 
                                type='text'
                                placeholder='Type a message...' 
                                className='flex-1 bg-neutral-950 border border-neutral-700 text-neutral-200 focus:border-indigo-500 outline-none px-4 py-3 rounded-xl' 
                            />
                            <button type='submit' className='bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition flex items-center justify-center w-12 h-12'>
                                {sending ? <div className='loading loading-spinner w-5 h-5'></div> : <IoSend size={20} />}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default MessageContainer;