import React, { useEffect, useState, useRef, useCallback } from 'react';
import userConversation from '../../Zustans/useConversation';
import { useAuth } from '../../context/AuthContext';
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend, IoSearch, IoClose } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSocketContext } from '../../context/SocketContext';
import Avatar from './Avatar';

const MessageContainer = ({ onBackUser }) => {
    const { messages, selectedConversation, setMessage, setSelectedConversation } = userConversation();
    const { socket } = useSocketContext();
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendData, setSnedData] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchStatus, setSearchStatus] = useState(null);
    const lastMessageRef = useRef();
    const messagesContainerRef = useRef();
    const messageRefs = useRef({});

    const roomParam = selectedConversation?.isRoom ? '?isRoom=true' : '';

    useEffect(() => {
        if (!showSearch) {
            setSearchStatus(null);
            return;
        }

        const checkSearchStatus = async () => {
            try {
                const res = await axios.get('/api/search/status');
                setSearchStatus(res.data);
            } catch {
                setSearchStatus({ working: false, message: 'Could not check search status.' });
            }
        };

        checkSearchStatus();
    }, [showSearch]);

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
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedConversation, setMessage]);

    useEffect(() => {
        if (selectedConversation?.isRoom && socket) {
            socket.emit("joinRoom", selectedConversation._id);
        }
    }, [selectedConversation, socket]);

    useEffect(() => {
        if (!showSearch) {
            setTimeout(() => {
                lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages, showSearch]);

    useEffect(() => {
        const getMessages = async () => {
            setLoading(true);
            setShowSearch(false);
            setSearchResults([]);
            setSearchQuery("");
            try {
                const get = await axios.get(`/api/message/${selectedConversation?._id}${roomParam}`);
                const data = get.data;
                if (data?.success === false) {
                    toast.error(data.message || "Could not load messages");
                    setMessage([]);
                    setHasMore(false);
                } else if (Array.isArray(data)) {
                    setMessage(data);
                    setHasMore(false);
                } else {
                    setMessage(data.messages || []);
                    setHasMore(data.hasMore || false);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Could not load messages");
                setMessage([]);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        if (selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, selectedConversation?.isRoom, setMessage, roomParam]);

    const loadEarlierMessages = async () => {
        if (!hasMore || loadingMore || messages.length === 0) return;

        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        setLoadingMore(true);
        try {
            const oldestMessage = messages[0];
            const separator = roomParam ? '&' : '?';
            const get = await axios.get(
                `/api/message/${selectedConversation._id}${roomParam}${separator}before=${oldestMessage._id}`
            );
            const data = get.data;
            const olderMessages = Array.isArray(data) ? data : (data.messages || []);

            setMessage((prev) => [...olderMessages, ...prev]);
            setHasMore(Array.isArray(data) ? false : (data.hasMore || false));

            requestAnimationFrame(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight - previousScrollHeight;
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load earlier messages");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const separator = roomParam ? '&' : '?';
            const res = await axios.get(
                `/api/search/${selectedConversation._id}${roomParam}${separator}q=${encodeURIComponent(searchQuery.trim())}`
            );
            const data = res.data;
            if (data?.success === false) {
                toast.error(data.message || "Search failed");
                setSearchResults([]);
            } else {
                setSearchResults(data.results || []);
                if ((data.results || []).length === 0) {
                    toast.info("No matching messages found");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Search failed");
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const scrollToMessage = useCallback((messageId) => {
        setShowSearch(false);
        setSearchResults([]);
        setSearchQuery("");
        setTimeout(() => {
            const el = messageRefs.current[messageId];
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-2", "ring-indigo-400", "rounded-lg");
                setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400", "rounded-lg"), 2000);
            }
        }, 100);
    }, []);

    const clearSearch = () => {
        setShowSearch(false);
        setSearchResults([]);
        setSearchQuery("");
    };

    const handelMessages = (e) => {
        setSnedData(e.target.value);
    };

    const handelSubmit = async (e) => {
        e.preventDefault();
        if (!sendData.trim()) return;
        setSending(true);
        try {
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
    };

    return (
        <div className='w-full h-full min-h-0 flex flex-col'>
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
                        <button
                            onClick={() => setShowSearch((prev) => !prev)}
                            className='text-neutral-400 hover:text-indigo-400 transition p-2'
                            title="Search messages"
                        >
                            {showSearch ? <IoClose size={22} /> : <IoSearch size={22} />}
                        </button>
                    </div>

                    {showSearch && (
                        <div className='bg-neutral-900 border-b border-neutral-800 p-3'>
                            <form onSubmit={handleSearch} className='flex gap-2'>
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    type='text'
                                    placeholder='Search by meaning, e.g. "hackathon deadline"...'
                                    className='flex-1 bg-neutral-950 border border-neutral-700 text-neutral-200 focus:border-indigo-500 outline-none px-3 py-2 rounded-lg text-sm'
                                    autoFocus
                                />
                                <button
                                    type='submit'
                                    disabled={searching}
                                    className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50'
                                >
                                    {searching ? '...' : 'Search'}
                                </button>
                                <button
                                    type='button'
                                    onClick={clearSearch}
                                    className='text-neutral-400 hover:text-white px-3 py-2 text-sm'
                                >
                                    Clear
                                </button>
                            </form>
                            {searchStatus && (
                                <p className={`text-xs mt-2 ${searchStatus.working ? 'text-green-400' : 'text-amber-400'}`}>
                                    {searchStatus.message}
                                    {!searchStatus.working && ' Send new messages after fixing the key — old messages are not searchable.'}
                                </p>
                            )}
                        </div>
                    )}

                    <div ref={messagesContainerRef} className='flex-1 overflow-auto p-4 custom-scrollbar'>
                        {loading && (
                            <div className="flex w-full h-full flex-col items-center justify-center">
                                <div className="loading loading-spinner text-indigo-500"></div>
                            </div>
                        )}

                        {!loading && showSearch && searchResults.length > 0 && (
                            <div className='space-y-3 mb-4'>
                                <p className='text-xs text-neutral-500 uppercase tracking-wide'>Search results</p>
                                {searchResults.map((result) => (
                                    <button
                                        key={result._id}
                                        onClick={() => scrollToMessage(result._id)}
                                        className='w-full text-left bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl p-3 transition'
                                    >
                                        <div className='flex justify-between items-start gap-2 mb-1'>
                                            <span className='text-xs text-indigo-400 font-medium'>
                                                {result.similarityPercent}% match
                                            </span>
                                            <span className='text-xs text-neutral-500'>
                                                {new Date(result.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <p className='text-sm text-neutral-200'>{result.message}</p>
                                        {selectedConversation.isRoom && result.senderId?.username && (
                                            <p className='text-xs text-neutral-500 mt-1'>— {result.senderId.username}</p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!loading && !showSearch && hasMore && (
                            <div className='flex justify-center mb-4'>
                                <button
                                    onClick={loadEarlierMessages}
                                    disabled={loadingMore}
                                    className='text-sm text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50'
                                >
                                    {loadingMore ? 'Loading...' : 'Load earlier messages'}
                                </button>
                            </div>
                        )}

                        {!loading && !showSearch && messages?.length === 0 && (
                            <div className='flex items-center justify-center h-full'>
                                <p className='text-center text-neutral-500 font-medium'>Be the first to say hello!</p>
                            </div>
                        )}

                        {!loading && !showSearch && messages?.length > 0 && messages?.map((message, index) => (
                            <div
                                className='text-white'
                                key={message?._id}
                                ref={(el) => {
                                    messageRefs.current[message._id] = el;
                                    if (index === messages.length - 1) lastMessageRef.current = el;
                                }}
                            >
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
