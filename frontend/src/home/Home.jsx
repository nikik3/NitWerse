import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';

import userConversation from '../Zustans/useConversation';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const { setSelectedConversation } = userConversation();

  const handelUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarVisible(false);
  }

  const handelShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedUser(null);
    setSelectedConversation(null);
  }

  return (
    <div className='flex w-full h-screen bg-neutral-900 overflow-hidden'>
      <div className={`w-full md:w-72 flex-shrink-0 flex flex-col h-full border-r border-neutral-800 bg-neutral-900 ${isSidebarVisible ? '' : 'hidden'} md:flex`}>
        <Sidebar onSelectUser={handelUserSelect} />
      </div>
      <div className={`flex-1 flex flex-col min-h-0 h-full bg-neutral-950 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        <MessageContainer onBackUser={handelShowSidebar} />
      </div>
    </div>
  );
};

export default Home;
