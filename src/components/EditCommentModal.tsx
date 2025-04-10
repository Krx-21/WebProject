'use client'
import React, { useEffect, useRef, useState } from 'react';
import 'air-datepicker/air-datepicker.css';
import toast from 'react-hot-toast';
import { TextField } from '@mui/material';
import { editComments } from '@/services/comment.service';


export default function EditCommentModal({ onClose, commentId, name , img , posted , oldComment}:{onClose:Function, commentId:string,  name:string, img:string, posted:Function, oldComment:string }) {   
    const [comment ,setComment] = useState("")
    
    const  handlePut = async () => {
        try {
            const response = await editComments(commentId,comment)
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
            <div className="bg-white p-6 rounded-3xl shadow-xl w-[90%] ">  
                <div className="flex flex-row relative ">
                    <div className="size-10 rounded-full inline border-2 border-red-300 bg-slate-100 " />
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

                <div className='w-full flex flex-row gap-3 mt-4 justify-end pr-5'>
                    <button className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300" onClick={() => { onClose(commentId); }}>cancel</button>
                    <button className="w-[5%] bg-white text-black py-2 border-2 rounded-full hover:bg-slate-300" onClick={() => { if(!comment)return; handlePut(); onClose(commentId); } }>post</button>
                </div>
            </div>
        </div>
    );
}
