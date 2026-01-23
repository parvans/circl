"use client"
import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ImageIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { createPost } from '@/actions/post.action';
import { toast } from 'sonner';

export default function CreatePost() {
  const {user} = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async()=>{
    if(!content.trim()) return;
    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if(result.success){
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        toast.success("Post created successfully");
      }
    } catch (error) {
      console.log("Error creating post", error);
      toast.error("Failed to create post");
    } finally{
      setIsPosting(false);
    }
  }



  return (
    <Card className='mb-6'>
      <CardContent className='pt-2'>
        <div className='space-y-4'>
          <div className='flex space-x-4'>
            <Avatar className='w-10 h-10'>
              <AvatarImage src={user?.imageUrl || "/avatar.png"}/>
            </Avatar>
            <Textarea
            placeholder='What do you want to talk about?'
            className='min-h-25 resize-none border-none focus-visible:ring-0 p-0 
            text-base bg-transparent! placeholder:text-muted-foreground max-h-60'
            value={content}
            onChange={(e)=>setContent(e.target.value)}
            disabled={isPosting}
            />
          </div>

          <div className='flex items-center justify-between border-t pt-4'>
            <div className='flex space-x-2'>
              <Button
              type='button'
              variant={"ghost"}
              size={"sm"}
              className='text-muted-foreground hover:text-primary'
              >
                <ImageIcon className=' size-4 mr-2'/>
                Photo
              </Button>
            </div>
              <Button
              type='button'
              disabled={isPosting || !content.trim()}
              onClick={handleSubmit}
              >
                {isPosting ? (
                  <>
                  <Loader2Icon className='size-4 mr-2 animate-spin'/>
                  Posting...
                  </>
                ) : (
                  <>
                  <SendIcon className='size-4 mr-1'/>
                  Post
                  </>
                )}
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
