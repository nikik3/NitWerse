import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaComments, FaUsers, FaSearch } from 'react-icons/fa';

const Landing = () => {
    const { authUser } = useAuth();

    if (authUser) return <Navigate to="/chat" />;

    return (
        <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 overflow-x-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-24 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
                    <span className="text-3xl md:text-4xl font-black tracking-tighter text-white">NW</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3">
                    Nit<span className="text-indigo-400">Werse</span>
                </h1>

                <p className="text-neutral-400 text-sm md:text-base font-medium tracking-widest uppercase mb-8">
                    NIT Warangal · Campus Connect
                </p>

                <p className="text-neutral-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
                    A campus communication platform built for NIT Warangal. Clubs and departments
                    can create dedicated chat rooms for events and discussions, while students can
                    message each other directly, search by username, and see who is online.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link
                        to="/register"
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold rounded-xl border border-neutral-700 transition"
                    >
                        Log In
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-left">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                            <FaUsers className="text-indigo-400" size={18} />
                        </div>
                        <h3 className="font-bold text-neutral-100 mb-2">Club & Event Rooms</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            Create rooms for club meetings, event coordination, or group discussions.
                            Open rooms for anyone to join, or protect sensitive ones with a password.
                        </p>
                    </div>

                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-left">
                        <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                            <FaComments className="text-violet-400" size={18} />
                        </div>
                        <h3 className="font-bold text-neutral-100 mb-2">Direct Messages</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            Private one-on-one conversations with real-time delivery.
                            Online status indicators show when someone is available to chat.
                        </p>
                    </div>

                    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 text-left">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center mb-4">
                            <FaSearch className="text-indigo-400" size={18} />
                        </div>
                        <h3 className="font-bold text-neutral-100 mb-2">User Search</h3>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            Find and connect with any registered user by username.
                            No need to exchange phone numbers to start a conversation.
                        </p>
                    </div>
                </div>

                <p className="mt-16 text-xs text-neutral-600">
                    Built for the NIT Warangal community · Version 1.0
                </p>
            </div>
        </div>
    );
};

export default Landing;
