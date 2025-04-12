'use client'
import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster }  from 'react-hot-toast';
import { TextField } from '@mui/material';
import { createComments } from '@/services/comment.service';

export default function CommentModal({ isOpen, onClose , name, cid , posted }:{isOpen:boolean,onClose:Function, name:string , cid :string , posted:Function }) {
    const [comment ,setComment] = useState("");
    const [rating, setRating] = useState(0);
    
    
    const  handlePost = async () => {
        try {
            const response = await createComments(cid , comment, rating);
            if(response.success) posted();
        }catch (e) {
            toast.error('failed to comment')
        }
    }

    if (!isOpen) return null;

    return (
        
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <Toaster />
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
                        label="Your Comment"
                        variant="standard"
                        required
                        value={comment}
                        className='w-full'
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="w-full mt-4">
                    <p className="text-black mb-2">Rating:</p>
                    <div className="flex gap-1 text-2xl">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`cursor-pointer ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setRating(i + 1)} 
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>


                <div className="w-full flex flex-row gap-4 mt-6 justify-end pr-6">
                    <button
                        className="px-5 py-2 bg-gray-200 text-gray-800 border border-gray-400 rounded-full hover:bg-gray-300 transition-all duration-200"
                        onClick={() => {
                            onClose();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 bg-blue-600 text-white border border-blue-700 rounded-full hover:bg-blue-700 transition-all duration-200"
                        onClick={() => {
                            if (!comment || rating === 0) {
                                if (!comment) {
                                    toast.error('Please enter a comment');
                                }
                                if (rating === 0) {
                                    toast.error('Please select a rating');
                                }
                                return;
                            }
                            handlePost();
                            onClose();
                        }}
                    >
                        Comment
                    </button>
                </div>
                
            </div>
        </div>
    );
}
