'use client'
import React, { useEffect, useRef, useState } from 'react';
import 'air-datepicker/air-datepicker.css';
import toast, { Toaster } from 'react-hot-toast';
import { TextField } from '@mui/material';
import { editComments } from '@/services/comment.service';


export default function EditCommentModal({ onClose, commentId, name, img, rating, oldComment, posted}:{ onClose:Function, commentId:string, name:string, img:string, rating:number, oldComment:string, posted:Function}) {   
    const [comment ,setComment] = useState("");
    const [currentRating, setCurrentRating] = useState(rating);
    
    const  handlePut = async () => {
        try {
            const response = await editComments(commentId, comment, currentRating)
            if(response.ok){
                posted();
                toast.success('Comment update complete')
            }
            posted();
        }catch (e) {
            toast.error('comment Fail')
        }
    }


    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Toaster />
            <div className="bg-white p-6 rounded-3xl shadow-xl w-[90%] ">  
                <div className="flex flex-row relative ">
                    <div className="size-10 rounded-full inline border-2 border-red-300</div> bg-slate-100 " />
                    <div className="flex flex-col pl-3">
                        <p className="text-black">{name}</p>
                    </div>
                </div>
                <div className='w-full'>
                    <TextField
                        id="comment"
                        name="Comment"
                        label={oldComment || "new comment here"}
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
                                className={`cursor-pointer ${i < currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setCurrentRating(i + 1)} 
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className='w-full flex flex-row gap-3 mt-4 justify-end pr-5'>
                    <button className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300" onClick={() => { onClose(commentId); }}>cancel</button>
                    <button className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300" onClick={() => { if(!comment)return; handlePut(); onClose(commentId); } }>post</button>
                </div>
            </div>
        </div>
    );
}
