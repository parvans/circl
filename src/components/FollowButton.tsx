"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { toggleFollow } from '@/actions/user.action';

export default function FollowButton({userId}:{userId:string}) {
    const [isLoading, setIsLoading] = useState(false);
    const handleFollow = async()=>{
        setIsLoading(true);
        try {
            await toggleFollow(userId);
            toast.success("Followed user successfully");
        } catch (error) {
            console.log("Error following user", error);
            toast.error("Failed to follow user");
        }
    }
  return (
    <Button 
     size="sm"
     variant={"secondary"}
     onClick={handleFollow}
     disabled={isLoading}
     className='w-20'
     >
        {isLoading ? <Loader className="size-4 animate-spin" /> : "Follow"}
    </Button>
  )
}
