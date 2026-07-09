import axios from 'axios';
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Login = () => {

    const navigate = useNavigate();
    const {setAuthUser} = useAuth();

    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(false)

    const handelInput = (e) => {
        setUserInput({
            ...userInput, [e.target.id]: e.target.value
        })
    }

    const handelSubmit = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const login = await axios.post(`/api/auth/login`, userInput);
            const data = login.data;
            if (data.success === false) {
                toast.error(data.message || "Login failed");
                return;
            }
            toast.success(data.message || "Logged in successfully!");
            localStorage.setItem('chatapp', JSON.stringify(data));
            setAuthUser(data);
            navigate('/chat');
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed. Please try again.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 px-4'>
            <Link to="/" className="mb-8 flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                    <span className="text-xl font-black text-white">NW</span>
                </div>
                <span className="text-sm text-neutral-500 group-hover:text-neutral-400 transition">Back to home</span>
            </Link>
            <div className='w-full max-w-md p-6 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-800'>
                <h1 className='text-3xl font-bold text-center text-neutral-100'>Login
                    <span className='text-indigo-500'> NitWerse </span>
                    </h1>
                    <form onSubmit={handelSubmit} className='flex flex-col text-black'>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>Email :</span>
                            </label>
                            <input
                                id='email'
                                type='email'
                                onChange={handelInput}
                                placeholder='Enter your email'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>Password :</span>
                            </label>
                            <input
                                id='password'
                                type='password'
                                onChange={handelInput}
                                placeholder='Enter your password'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>
                        <button type='submit'
                            className='mt-6 self-center 
                            w-full py-2 bg-indigo-600 hover:bg-indigo-700
                            text-lg font-semibold transition-colors
                            text-white rounded-lg'>
                           {loading ? "loading..":"Login"}
                            </button>
                    </form>
                    <div className='pt-4 text-center'>
                        <p className='text-sm text-neutral-400'>
                            Don't have an Account? <Link to={'/register'}>
                                <span
                                    className='text-indigo-400 
                            font-semibold hover:underline cursor-pointer
                             hover:text-indigo-300 ml-1'>
                                    Register Now!
                                </span>
                            </Link>
                        </p>
                    </div>
            </div>
        </div>
    )
}

export default Login