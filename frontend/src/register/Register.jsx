import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate()
    const {setAuthUser} = useAuth();
    const [loading , setLoading] = useState(false);
    const [inputData , setInputData] = useState({})

    const handelInput=(e)=>{
        setInputData({
            ...inputData , [e.target.id]:e.target.value
        })
    }

    const selectGender=(selectGender)=>{
        setInputData((prev)=>({
            ...prev , gender:selectGender === inputData.gender ? '' : selectGender
        }))
    }

    const handelSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true)
        if(inputData.password !== inputData.confpassword.toLowerCase()){
            setLoading(false)
            return toast.error("Password Dosen't match")
        }
        try {
            const register = await axios.post(`/api/auth/register`,inputData);
            const data = register.data;
            if(data.success === false){
                setLoading(false)
                toast.error(data.message)
                console.log(data.message);
            }
            toast.success(data?.message)
            localStorage.setItem('chatapp',JSON.stringify(data))
            setAuthUser(data)
            setLoading(false)
            navigate('/chat')
        } catch (error) {
            setLoading(false)
            console.log(error);
            toast.error(error?.response?.data?.message)
        }
    }

  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 px-4 py-8'>
            <Link to="/" className="mb-6 flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
                    <span className="text-xl font-black text-white">NW</span>
                </div>
                <span className="text-sm text-neutral-500 group-hover:text-neutral-400 transition">Back to home</span>
            </Link>
            <div className='w-full max-w-md p-6 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-800'>
  <h1 className='text-3xl font-bold text-center text-neutral-100'>Register
                    <span className='text-indigo-500'> NitWerse </span>
                    </h1>
                    <form onSubmit={handelSubmit} className='flex flex-col text-black'>
                    <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>fullname :</span>
                            </label>
                            <input
                                id='fullname'
                                type='text'
                                onChange={handelInput}
                                placeholder='Enter Full Name'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>username :</span>
                            </label>
                            <input
                                id='username'
                                type='text'
                                onChange={handelInput}
                                placeholder='Enter UserName'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>Email :</span>
                            </label>
                            <input
                                id='email'
                                type='email'
                                onChange={handelInput}
                                placeholder='Enter email'
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
                                placeholder='Enter password'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>
                        <div>
                            <label className='label p-2' >
                                <span className='font-bold text-neutral-300 text-lg label-text'>Conf.Password :</span>
                            </label>
                            <input
                                id='confpassword'
                                type='password'
                                onChange={handelInput}
                                placeholder='Enter Confirm password'
                                required
                                className='w-full input h-10 bg-neutral-950 border border-neutral-800 text-neutral-200 focus:border-indigo-500 focus:outline-none' />
                        </div>

                        <div
                         id='gender' className="flex gap-2">
                        <label className="cursor-pointer label flex gap-2">
                        <span className="label-text font-semibold text-neutral-300">male</span>
                        <input 
                        onChange={()=>selectGender('male')}
                        checked={inputData.gender === 'male'}
                        type='checkbox' 
                        className="checkbox checkbox-info border-neutral-600"/>
                        </label>
                        <label className="cursor-pointer label flex gap-2">
                        <span className="label-text font-semibold text-neutral-300">female</span>
                        <input 
                        checked={inputData.gender === 'female'}
                        onChange={()=>selectGender('female')}
                        type='checkbox' 
                        className="checkbox checkbox-info"/>
                        </label>
                        </div>

                        <button type='submit'
                            className='mt-6 self-center 
                            w-full py-2 bg-indigo-600 hover:bg-indigo-700
                            text-lg font-semibold transition-colors
                            text-white rounded-lg'>
                           {loading ? "loading..":"Register"}
                            </button>
                    </form>

                    <div className='pt-4 text-center'>
                        <p className='text-sm text-neutral-400'>
                            Don't have an Account? <Link to={'/login'}>
                                <span
                                    className='text-indigo-400 
                            font-semibold hover:underline cursor-pointer
                             hover:text-indigo-300 ml-1'>
                                    Login Now!
                                </span>
                            </Link>
                        </p>
                    </div>
           </div>
           </div>
  )
}

export default Register