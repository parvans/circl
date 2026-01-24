"use client";
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { useUser } from '@clerk/nextjs';
import { createComment, deletePost, getPosts, toggleLike } from '@/actions/post.action';
import { toast } from 'sonner';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

export default function PostCard({post, dbUserId}:{post:Post, dbUserId?:string | null}) {
    const user = useUser();
    const [newComment, setNewComment] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasLiked, setHasLiked] = useState(post.likes.some((like)=>like.userId === dbUserId));
    const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);

    const handleLikes = async()=>{
        if(isLiking) return;
        try {
            setIsLiking(true);
            setHasLiked(prev=>!prev);
            setOptimisticLikes(prev=>prev + (hasLiked ? -1 : 1));
            await toggleLike(post.id);
        } catch (error) {
            setOptimisticLikes(post._count.likes);
            setHasLiked(post.likes.some((like)=>like.userId === dbUserId));
            console.log("Error liking post", error);
        }
    }

    const handleAddComment = async()=>{
        if(!newComment.trim() || isCommenting) return;
        try {
            setIsCommenting(true);
            const result = await createComment(post.id,newComment);
            if(result?.success){
                toast.success("Comment posted successfully");
                setNewComment("");
            }
        } catch (error) {
            toast.error("Failed to add comment");
        }finally{
            setIsCommenting(false);
        }
    }
    const handleDeletePost = async()=>{
        if(!isDeleting) return;
        try {
            setIsDeleting(true);
            const result = await deletePost(post.id);
            if(result?.success){
                toast.success("Post deleted successfully");
            }else{
                throw new Error(result?.error);
            }
        } catch (error) {
            toast.error("Failed to delete post");
        }finally{
            setIsDeleting(false)
        }
    }
  return (
    <Card className='overflow-hidden'>
        <CardContent className='p-4 sm:p-6'>
            <div className='space-y-4'>
                <div className='flex space-x-3 sm:space-x-4'>
                    <Link href={`/profile/${post.author.username}`}>
                        <Avatar className='size-8 sm:w-10 sm:h-10'>
                            <AvatarImage src={post.author.image || "/avatar.png"}/>
                        </Avatar>
                    </Link>
                    <div 
                    // className='flex-1 min-w-0'
                    >
                        <div 
                            // className='flex items-start justify-between'
                        >
                            {/* header */}
                            <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate'>
                                <Link 
                                href={`/profile/${post.author.username}`}
                                className='font-semibold truncate'
                                >
                                {post.author.name}  
                                </Link>
                                <div className='flex items-center space-x-2 text-sm text-accent-foreground'>
                                    <Link href={`/profile/${post.author.username}`}>@{post.author.username}</Link>
                                    <span>*</span>
                                    <span>12/03/2026</span>
                                </div>
                            </div>

                            

                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
        {post.content}
    </Card>
  )
}
