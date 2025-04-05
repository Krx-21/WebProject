'use client'
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CommentModal from "@/components/Comment/CommentModal";
import { getUserProfile } from '@/services/user.service';
import getComments from "@/libs/getComments";
import EditCommentModal from "@/components/Comment/EditCommentModal";
import { useAuth } from "@/contexts/AuthContext";

interface CommentItem {
    _id:string,
    user:string ,
    imagesUser:string,
    nameUser:string,
    restaurant: string,
    comment: string,
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

    if (!mounted || isLoading) {
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

    //Delete Comment
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/cars/${id}/comments`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${user?.token}`,
                },
            });
            if (response.ok) {
                setIsCommentPosted(prev => !prev);
                toast.success('Deleted Successfully');
            }
        } catch (e) {
            toast.error('Failed to delete comment');
        }
    };

    return (
        <div className="mt-10">
            <div className="ml-2 text-xl font-semibold">Comments</div>
            <div className="rounded-md flex flex-col bg-slate-100 pt-2">
                <div className="flex justify-end mr-3">
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
                                    <p className="text-black">{comment.nameUser || comment.user}</p>
                                    <p className="text-xs text-black">{comment.createAt}</p>
                                </div>
                                <div className="flex flex-row gap-1 pt-1 absolute right-2"
                                    onClick={() => {
                                        if ((userInfo.role !== 'admin') && (user?._id !== comment.user)) return;
                                        setOpenDropdown(openDropdown === comment._id ? null : comment._id);
                                    }}>
                                    <div className="rounded-full size-2 bg-black"></div>
                                    <div className="rounded-full size-2 bg-black"></div>
                                    <div className="rounded-full size-2 bg-black"></div>
                                    {openEditModal === comment._id && <EditCommentModal
                                        onClose={() => setOpenEditModal(null)}
                                        commentId={comment._id}
                                        carID={cid}
                                        name={userInfo.name} 
                                        oldComment={comment.comment}
                                        img={""}
                                        posted={() => setIsCommentPosted(prev => !prev)}
                                    />}
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
                carID={cid}
                name={userInfo.name}
                posted={() => setIsCommentPosted(prev => !prev)}
            />
        </div>
    );
}
