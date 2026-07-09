import React, { useEffect, useState } from 'react';
import { FaSearch, FaLock, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import userConversation from '../../Zustans/useConversation';
import { useSocketContext } from '../../context/SocketContext';
import Avatar from './Avatar';

const Sidebar = ({ onSelectUser }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [activeTab, setActiveTab] = useState('dm'); // 'dm' or 'rooms'

    // DM states
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchuser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    
    // Room states
    const [rooms, setRooms] = useState([]);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomPassword, setNewRoomPassword] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null);
    const [joinPassword, setJoinPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSetSelectedUserId] = useState(null);
    const { setSelectedConversation } = userConversation();
    const { onlineUser } = useSocketContext();

    const nowOnline = chatUser.map((user) => (user._id));
    const isOnline = nowOnline.map(userId => onlineUser.includes(userId));

    // Fetch DMs
    useEffect(() => {
        if (activeTab === 'dm') {
            const fetchChatters = async () => {
                setLoading(true);
                try {
                    const res = await axios.get(`/api/user/currentchatters`);
                    setChatUser(res.data);
                } catch (error) {
                    console.log(error);
                }
                setLoading(false);
            };
            fetchChatters();
        }
    }, [activeTab]);

    // Fetch Rooms
    useEffect(() => {
        if (activeTab === 'rooms') {
            fetchRooms();
        }
    }, [activeTab]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/room/all`);
            setRooms(res.data);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handelSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchInput) return;
        setLoading(true);
        try {
            const search = await axios.get(`/api/user/search?search=${searchInput}`);
            const data = search.data;
            if (data.length === 0) {
                toast.info("User Not Found");
            } else {
                setSearchuser(data);
            }
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    const handelUserClick = (user) => {
        onSelectUser(user);
        setSelectedConversation(user);
        setSetSelectedUserId(user._id);
    };

    const handleRoomClick = async (room) => {
        // Check if user is already a participant
        if (room.participants.some(p => p.toString() === authUser._id.toString())) {
            const roomObj = { ...room, isRoom: true };
            onSelectUser(roomObj);
            setSelectedConversation(roomObj);
            setSetSelectedUserId(room._id);
            return;
        }

        // If not participant and password protected, show modal
        if (room.isPasswordProtected) {
            setSelectedRoomToJoin(room);
            setShowJoinModal(true);
        } else {
            // Join without password
            joinRoomReq(room._id, '');
        }
    };

    const joinRoomReq = async (roomId, password) => {
        try {
            const res = await axios.post(`/api/room/${roomId}/join`, { password });
            if (res.data.success) {
                toast.success("Joined room successfully!");
                setShowJoinModal(false);
                setJoinPassword('');
                fetchRooms(); // refresh participants
                const roomObj = { ...res.data.room, isRoom: true };
                onSelectUser(roomObj);
                setSelectedConversation(roomObj);
                setSetSelectedUserId(roomObj._id);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to join room");
        }
    };

    const createRoomReq = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) {
            toast.error("Room name is required");
            return;
        }
        try {
            const res = await axios.post('/api/room/create', { name: newRoomName, password: newRoomPassword });
            if (res.status === 201) {
                toast.success("Room created!");
                setShowCreateRoom(false);
                setNewRoomName('');
                setNewRoomPassword('');
                fetchRooms();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create room");
            console.log("Create room error:", error.response?.data);
        }
    };

    const handelLogOut = async () => {
        const confirmlogout = window.prompt("Type your username to logout");
        if (confirmlogout === authUser.username) {
            try {
                await axios.post('/api/auth/logout');
                toast.info("Logged out successfully");
                localStorage.removeItem('chatapp');
                setAuthUser(null);
                navigate('/');
            } catch (error) {
                console.log(error);
            }
        } else {
            toast.info("Logout Cancelled");
        }
    };

    return (
        <div className='w-full h-full min-h-0 flex flex-col text-neutral-200'>
            {/* NitWerse Brand Header */}
            <div className='px-4 pt-4 pb-3 border-b border-neutral-800 mb-1'>
                <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs'>N</div>
                    <span className='font-extrabold text-white tracking-tight text-lg'>NitWerse</span>
                    <span className='text-xs text-neutral-500 font-medium ml-auto'>NITW</span>
                </div>
            </div>
            <div className='px-4 pt-3 pb-2'>
                <div className='flex gap-2 justify-center mb-4 bg-neutral-950 p-1 rounded-lg'>
                    <button 
                        onClick={() => setActiveTab('dm')} 
                        className={`flex-1 py-1 text-sm font-semibold rounded-md transition ${activeTab === 'dm' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>
                        Direct
                    </button>
                    <button 
                        onClick={() => setActiveTab('rooms')} 
                        className={`flex-1 py-1 text-sm font-semibold rounded-md transition ${activeTab === 'rooms' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'}`}>
                        Rooms
                    </button>
                </div>

                {activeTab === 'dm' ? (
                    <form onSubmit={handelSearchSubmit} className='flex items-center bg-neutral-950 border border-neutral-800 rounded-full px-3 py-1 focus-within:border-indigo-500 transition'>
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            type='text'
                            className='flex-1 bg-transparent outline-none text-sm text-neutral-200 placeholder:text-neutral-500'
                            placeholder='Search users...'
                        />
                        <button type='submit' className='text-neutral-400 hover:text-indigo-400'>
                            <FaSearch size={14} />
                        </button>
                    </form>
                ) : (
                    <button 
                        onClick={() => setShowCreateRoom(true)}
                        className='w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-full transition'>
                        <FaPlus size={12}/> Create Room
                    </button>
                )}
            </div>

            <div className='divider bg-neutral-800 h-[1px] my-2 mx-4'></div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                {loading && <div className="text-center mt-4 text-indigo-500"><div className="loading loading-spinner"></div></div>}
                
                {/* DMs View */}
                {activeTab === 'dm' && !loading && (
                    <>
                        {searchUser.length > 0 ? (
                            searchUser.map((user) => (
                                <div key={user._id} onClick={() => handelUserClick(user)}
                                    className={`flex gap-3 items-center rounded-xl p-2 cursor-pointer transition ${selectedUserId === user?._id ? 'bg-neutral-800' : 'hover:bg-neutral-900'}`}>
                                    <Avatar username={user.username} size={40} />
                                    <p className='font-semibold text-neutral-200'>{user.username}</p>
                                </div>
                            ))
                        ) : chatUser.length > 0 ? (
                            chatUser.map((user, index) => (
                                <div key={user._id} onClick={() => handelUserClick(user)}
                                    className={`flex gap-3 items-center rounded-xl p-2 cursor-pointer transition ${selectedUserId === user?._id ? 'bg-neutral-800' : 'hover:bg-neutral-900'}`}>
                                    <Avatar username={user.username} size={40} showOnlineDot={isOnline[index]} />
                                    <p className='font-semibold text-neutral-200'>{user.username}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-neutral-500 text-sm mt-4">Search a user to start chatting</p>
                        )}
                    </>
                )}

                {/* Rooms View */}
                {activeTab === 'rooms' && !loading && (
                    <>
                        {rooms.length > 0 ? (
                            rooms.map((room) => (
                                <div key={room._id} onClick={() => handleRoomClick(room)}
                                    className={`flex gap-3 items-center justify-between rounded-xl p-2 cursor-pointer transition ${selectedUserId === room?._id ? 'bg-neutral-800' : 'hover:bg-neutral-900'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-900/50 text-indigo-400 border border-indigo-800/50 flex items-center justify-center font-bold">
                                            #
                                        </div>
                                        <div>
                                            <p className='font-semibold text-neutral-200'>{room.name}</p>
                                            <p className='text-xs text-neutral-500'>{room.participants.length} member(s)</p>
                                        </div>
                                    </div>
                                    {room.isPasswordProtected && !room.participants.some(p => p.toString() === authUser._id.toString()) && (
                                        <FaLock className="text-neutral-500" size={12} />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-neutral-500 text-sm mt-4">No rooms available. Create one!</p>
                        )}
                    </>
                )}
            </div>

            <div className='mt-auto p-4 border-t border-neutral-800'>
                <div className='flex items-center justify-between'>
                    <div className="flex items-center gap-3">
                        <Avatar username={authUser?.username || 'User'} size={32} />
                        <span className="text-sm font-semibold text-neutral-300">{authUser?.username}</span>
                    </div>
                    <button onClick={handelLogOut} className='text-neutral-500 hover:text-red-500 transition p-2 bg-neutral-900 rounded-lg'>
                        <BiLogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Create Room Modal */}
            {showCreateRoom && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-80">
                        <h3 className="text-xl font-bold text-white mb-4">Create Room</h3>
                        <form onSubmit={createRoomReq} className="flex flex-col gap-3">
                            <input required value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} type="text" placeholder="Room Name" className="w-full bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500 h-10 px-3 rounded-lg text-sm" />
                            <input value={newRoomPassword} onChange={(e) => setNewRoomPassword(e.target.value)} type="text" placeholder="Password (Optional)" className="w-full bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500 h-10 px-3 rounded-lg text-sm" />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowCreateRoom(false)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 w-80">
                        <h3 className="text-xl font-bold text-white mb-4">Join {selectedRoomToJoin?.name}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); joinRoomReq(selectedRoomToJoin._id, joinPassword); }} className="flex flex-col gap-3">
                            <p className="text-sm text-neutral-400 mb-2">This room is password protected.</p>
                            <input required value={joinPassword} onChange={(e) => setJoinPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500 h-10 px-3 rounded-lg text-sm" />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => {setShowJoinModal(false); setJoinPassword('')}} className="px-4 py-2 text-sm text-neutral-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Join</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;