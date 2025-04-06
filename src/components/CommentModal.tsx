'use client'
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { TextField } from '@mui/material';

import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/user.service';

export default function CommentModal({ isOpen, onClose, carID , name, posted }:{isOpen:boolean,onClose:Function, carID:string, name:string, posted:Function }) {
    const [comment ,setComment] = useState("")
    
    const router = useRouter();
    const { user } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState({
        name: '',
        role: ''
    });
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const checkAuth = () => {
            if (!user) {
            router.push('/login');
            return;
            }
        };

        checkAuth();
        }, [mounted, user, router]);

        useEffect(() => {
        const loadUserProfile = async () => {
            if (!user) return;

            try {
            setIsLoading(true);
            const response = await getUserProfile();

            if (response.success) {
                console.log('Profile data received:', response.data);
                setUserProfile(response.data);
                
                setUserInfo({
                    name: response.data.name || user.name || '',
                    role: response.data.role || user.role || ''
                });
            } else {
                // ถ้าไม่สามารถดึงข้อมูลจาก API ได้ ให้ใช้ข้อมูลจาก Auth Context แทน
                setUserInfo({
                    name: response.data.name || user.name || '',
                    role: response.data.role || user.role || ''
                });
                setError('Could not load full profile data. Basic information is displayed.');
            }
            } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile data');
            } finally {
            setIsLoading(false);
            }
        };

        if (mounted && user) {
            loadUserProfile();
        }
    }, [user, mounted]);

    // post comment
    const  handlePost = async () => {
        try {
            // fetch api
            const response = await fetch(`http://localhost:5000/api/v1/cars/${carID}/comments/` ,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({
                    comment: comment,
                    nameUser: user?.name,
                    imagesUser: ""

                }), 
            })

            // if response.ok posted comment
            if(response.ok) posted();
        }catch (e) {
            toast.error('failed to comment')
        }
    }

    // check if !isOpen didn't show comment model
    if (!isOpen) return null;

    return (
        <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        >
            <div
                className="bg-white p-6 rounded-3xl shadow-xl w-[90%] "
            >
                
                <div className="flex flex-row relative ">
                    <div className="size-10 rounded-full inline border-2 border-red-300 bg-slate-100 "/>
                    
                    <div className="flex flex-col pl-3">
                        <p className="text-black">{name}</p>
                    </div>
                </div>
                <div className='w-full'>
                    <TextField
                        id="comment"
                        name="Comment"
                        label="comment here"
                        variant="standard"
                        required
                        value={comment}
                        className='w-full'
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>


                <div className='w-full flex flex-row gap-3 mt-4 justify-end pr-5'>
                    <button
                        className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300"
                            onClick={() => {
                                onClose();
                            }}
                    >
                        cancel
                    </button>
                     <button
                        className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300"
                            onClick={() => {
                                if(!comment)return;
                                handlePost();
                                onClose();

                            }}
                    >
                        post
                    </button>
                </div>
                
            </div>
        </div>
    );
}
