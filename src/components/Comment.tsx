'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CommentModal from "@/components/CommentModal";
import { getUserProfile } from '@/services/user.service';
import { getComments } from "@/services/comment.service";
import EditCommentModal from "@/components/EditCommentModal";
import { useAuth } from "@/contexts/AuthContext";
import { deleteComments } from "@/services/comment.service";

interface CommentItem {
    _id:string,
    user:{
        _id:string,
        name:string,
        image:string
    } ,
    car: string,
    comment: string,
    rating: number,
    createdAt: string
}
interface UseerItem {
    _id:string,
    name:string ,
    telephoneNumber:string,
    email:string,
    role: string,
    createAt: string
}

export default function CommentSection({ cid }: { cid: string }) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openEditModal, setOpenEditModal] = useState<string | null>(null);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [isCommentPosted, setIsCommentPosted] = useState(false);
    const [showComModal, setShowComModal] = useState(false);

    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<UseerItem | null>(null);

    // format Date
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        if ( !user) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [comments, userProfile] = await Promise.all([
                    getComments(cid),
                    getUserProfile()
                ]);
                setComments(comments.data);
                setUserProfile(userProfile.data);
            }catch (e){
                console.log(`Error fetch Data comment ${e}`)
            }finally {
                setIsLoading(false);
            }
            
        }
        fetchData();
    }, [isCommentPosted]);

    if ( isLoading) {
        console.log('no mount !!!')
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-pulse text-center">
                    <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    const handleDelete = async (id: string) => {
        try {
            const response = await deleteComments(id);
            if (response.success) {
                setIsCommentPosted(prev => !prev);
                toast.success('Deleted Successfully');
            }
        } catch (e) {
            toast.error('Failed to delete comment');
        }
    };

    return (
        <div className="mt-10">

            <div className="rounded-md flex flex-col bg-slate-100 pt-2">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center text-3xl font-semibold">
                        Comments
                        {comments.length > 0 && (
                            <span className="ml-4 text-xl text-blue-800 px-4 py-2 bg-blue-100 border border-blue-400 rounded-md">
                            Rating: {(
                                    comments.reduce((sum, comment) => sum + (Number(comment.rating) || 0), 0) / comments.length
                                ).toFixed(1)} ★
                            </span>
                        )}
                    </div>
                    <button
                        className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition duration-300"
                        onClick={() => {
                            if (!user) {
                                router.push('/login');
                                return;
                            }
                            setShowComModal(true);
                        }}
                    >
                        <span className="text-lg font-semibold">Add Comment</span>
                    </button>
                </div>
                {comments.length > 0 ? (
                    comments.map((comment: CommentItem) => (
                        <div key={comment._id} className="rounded-lg bg-white p-3 m-2">
                            <div className="flex flex-row relative">
                                <div className="size-10 rounded-full inline border-2 border-red-300 bg-slate-100"/>
                                <div className="flex flex-col pl-3">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-black font-semibold">{comment.user.name || 'Unknown'}</p>
                                        <div className="flex text-xl">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                            ★
                                            </span>
                                        ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt) || 'Unknown time'}</p>
                                </div>
                                <div className="flex flex-row gap-1 pt-1 absolute right-2"
                                    onClick={() => {
                                        if ((userProfile?.role !== 'admin') && (userProfile?._id  !== comment.user._id)) return;
                                        setOpenDropdown(openDropdown === comment._id ? null : comment._id);
                                    }}
                                >   
                                    <div className="rounded-full size-2 bg-black"></div>
                                    <div className="rounded-full size-2 bg-black"></div>
                                    <div className="rounded-full size-2 bg-black"></div>
                                    {openEditModal === comment._id && 
                                        <EditCommentModal
                                            onClose={() => setOpenEditModal(null)}
                                            commentId={comment._id}
                                            name={userProfile?.name as string} 
                                            img={comment.user.image || ""}
                                            rating={comment.rating}
                                            oldComment={comment.comment}
                                            posted={() => setIsCommentPosted(prev => !prev)}
                                        />
                                    }
                                    {openDropdown === comment._id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                                            <button className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                                                onClick={() => setOpenEditModal(comment._id)}>
                                                Edit
                                            </button>
                                            <button className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                                                onClick={() => handleDelete(comment._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3">{comment.comment}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-2xl m-10">No Comments</div>
                )}
            </div>
            <CommentModal
                isOpen={showComModal}
                onClose={() => setShowComModal(false)}
                cid={cid}
                name={userProfile?.name as  string}
                posted={() => setIsCommentPosted(prev => !prev)}
            />
        </div>
    );
}
