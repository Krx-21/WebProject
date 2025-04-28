'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getUserProfile } from '@/services/user.service';
import { getComments, createComments } from "@/services/comment.service";
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

interface KeyboardEventWithShift extends React.KeyboardEvent<HTMLTextAreaElement> {
  shiftKey: boolean;
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
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);

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
        //if ( !user) return;
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

    const handlePost = async () => {
        // Add role check before trying to post
        if (userProfile?.role === 'provider') {
            toast.error('Providers are not allowed to comment on cars');
            return;
        }

        try {
            const response = await createComments(cid, comment, rating);
            if (response.success) {
                setComment("");
                setRating(0);
                setIsCommentPosted(prev => !prev);
                toast.success('Comment posted successfully');
            }
            toast.error('Failed to post comment');
        } catch (e) {
            toast.error('Failed to post comment');
        }
    };

    const handleKeyDown = (e: KeyboardEventWithShift) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            } else {
                e.preventDefault();
                if (comment.trim() && rating > 0) {
                    handlePost();
                } else {
                    if (!comment.trim()) {
                        toast.error('Please enter a comment');
                    }
                    if (rating === 0) {
                        toast.error('Please select a rating');
                    }
                }
            }
        }
    };

    return (
        <div className="mt-10">
            <div className="card-base">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 
                            dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
                            bg-clip-text text-transparent">
                            Comments
                        </h2>
                        {comments.length > 0 && (
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 
                                border border-blue-200 dark:border-blue-800 rounded-lg">
                                <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
                                    {(comments.reduce((sum, comment) => sum + (Number(comment.rating) || 0), 0) / comments.length).toFixed(1)} ★
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {user && userProfile?.role !== 'provider' ? (
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 
                                dark:from-blue-900 dark:to-blue-800 flex items-center justify-center flex-shrink-0">
                                {userProfile?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="Share your thoughts... (Press Enter to send, Shift + Enter for new line)"
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg 
                                        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                        focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500"
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    onKeyDown={handleKeyDown}  
                                />
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Press Enter to send, Shift + Enter for new line
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex gap-1 text-2xl">
                                        {[...Array(5)].map((_, i) => (
                                            <button
                                                key={i}
                                                className={`cursor-pointer transition-colors duration-150
                                                    ${i < rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                                onClick={() => setRating(i + 1)}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                            transition-colors duration-200 disabled:opacity-50"
                                        onClick={handlePost}
                                        disabled={!comment.trim() || rating === 0}
                                    >
                                        Post Comment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                        {!user ? (
                            <button
                                onClick={() => router.push('/login')}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Log in to leave a comment
                            </button>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">
                                Providers are not allowed to comment on cars
                            </p>
                        )}
                    </div>
                )}

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 
                                            dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                                            {comment.user.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                {comment.user.name || 'Unknown'}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {(userProfile?.role === 'admin' || userProfile?._id === comment.user._id) && (
                                        <div className="relative">
                                            <button 
                                                onClick={() => setOpenDropdown(openDropdown === comment._id ? null : comment._id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                            >
                                                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </button>

                                            {openDropdown === comment._id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 
                                                    rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
                                                    py-1 z-50">
                                                    <button
                                                        onClick={() => setOpenEditModal(comment._id)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 
                                                            dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(comment._id)}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 
                                                            dark:hover:bg-red-900/20"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <p className="mt-4 text-gray-700 dark:text-gray-300">
                                    {comment.comment}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">
                                No Comments Yet
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                                Be the first to share your thoughts!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {openEditModal && (
                <EditCommentModal
                    onClose={() => setOpenEditModal(null)}
                    commentId={openEditModal}
                    name={userProfile?.name || ''}
                    img={comments.find(c => c._id === openEditModal)?.user.image || ''}
                    rating={comments.find(c => c._id === openEditModal)?.rating || 0}
                    oldComment={comments.find(c => c._id === openEditModal)?.comment || ''}
                    posted={() => setIsCommentPosted(prev => !prev)}
                />
            )}
        </div>
    );
}
