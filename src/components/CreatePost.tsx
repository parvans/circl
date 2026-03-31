"use client"
import { useUser } from '@clerk/nextjs'
import React, { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from 'lucide-react';
import { createPost, getPostImageUploadSignature } from '@/actions/post.action';
import { toast } from 'sonner';
import EmojiPicker from './EmojiPicker';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function CreatePost() {
  const {user} = useUser();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const appendEmoji = (emoji: string) => {
    setContent((prev) => `${prev}${emoji}`);
  };

  const clearSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(null);
    setImagePreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Please choose an image smaller than 5MB.");
      event.target.value = "";
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    event.target.value = "";
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return "";

    const signatureResult = await getPostImageUploadSignature();

    if (!signatureResult?.success) {
      throw new Error(signatureResult?.error || "Image upload is unavailable right now.");
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("api_key", signatureResult.apiKey);
    formData.append("timestamp", String(signatureResult.timestamp));
    formData.append("signature", signatureResult.signature);
    formData.append("folder", signatureResult.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureResult.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const payload = await response.json();

    if (!response.ok || !payload.secure_url) {
      throw new Error(payload.error?.message || "Failed to upload image.");
    }

    return payload.secure_url as string;
  };

  const handleSubmit = async()=>{
    if(!content.trim() && !imageFile) return;
    setIsPosting(true);
    try {
      const uploadedImageUrl = imageFile ? await uploadImageToCloudinary() : "";
      const result = await createPost(content, uploadedImageUrl);
      if(result?.success){
        setContent("");
        clearSelectedImage();
        toast.success("Post created successfully");
      } else {
        throw new Error(result?.error || "Failed to create post");
      }
    } catch (error) {
      console.log("Error creating post", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally{
      setIsPosting(false);
    }
  }



  return (
    <Card className='mb-6'>
      <CardContent className='pt-2'>
        <div className='space-y-4'>
          <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleImageChange}
          disabled={isPosting}
          />
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

          {imagePreviewUrl ? (
            <div className='relative overflow-hidden rounded-2xl border bg-muted/20'>
              <img
              src={imagePreviewUrl}
              alt='Selected image preview'
              className='max-h-96 w-full object-contain'
              />
              <Button
              type='button'
              size='icon-sm'
              variant='secondary'
              className='absolute right-3 top-3'
              onClick={clearSelectedImage}
              disabled={isPosting}
              >
                <XIcon className='size-4'/>
                <span className='sr-only'>Remove image</span>
              </Button>
            </div>
          ) : null}

          <div className='flex items-center justify-between border-t pt-4'>
            <div className='flex space-x-2'>
              <EmojiPicker onSelect={appendEmoji} />
              <Button
              type='button'
              variant={"ghost"}
              size={"sm"}
              className='text-muted-foreground hover:text-primary'
              onClick={() => fileInputRef.current?.click()}
              disabled={isPosting}
              >
                <ImageIcon className=' size-4 mr-2'/>
                {imageFile ? "Change photo" : "Photo"}
              </Button>
            </div>
              <Button
              type='button'
              disabled={isPosting || (!content.trim() && !imageFile)}
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
