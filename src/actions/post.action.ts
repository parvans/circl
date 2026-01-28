"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, imageUrl: string) => {
    try {
        const userId = await getDbUserId();
        if (!userId) return;
        const post = await prisma.posts.create({
            data:{
                content,
                image:imageUrl,
                authorId:userId
            }
        });

        revalidatePath("/"); // Revalidate the home page to show the new post
        return {success:true, post};

    } catch (error) {
        console.log("Error creating post", error);
        return {success:false, error:"Failed to create post"};
    }
}

export const getPosts = async()=>{
    try {
        const posts = await prisma.posts.findMany({
            orderBy:{
                createdAt:"desc"
            },
            include:{
                author:{
                    select:{
                        id:true,
                        name:true,
                        username:true,
                        image:true
                    }
                },
                comments:{
                    include:{
                        author:{
                            select:{
                                id:true,
                                name:true,
                                username:true,
                                image:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:"desc"
                    }
                },
                likes:{
                    select:{
                        userId:true
                    }
                },
                _count:{
                    select:{
                        comments:true,
                        likes:true
                    }
                }
            }
        });

        return posts;
    } catch (error) {
        console.log("Error fetching posts", error);
        throw new Error("Failed to fetch posts");
    }
}

export const toggleLike = async(postId:string)=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return;

        const existingLike = await prisma.likes.findUnique({
            where:{
                userId_postId:{
                    userId,
                    postId
                }
            }
        });

        const post = await prisma.posts.findUnique({
            where:{id:postId},
            select:{authorId:true}
        });
        if(!post) throw new Error("Post not found");


        if(existingLike){
            await prisma.likes.delete({
                where:{
                    userId_postId:{
                        userId,
                        postId
                    }
                }
            });
        }else{
            await prisma.$transaction([
                prisma.likes.create({
                    data:{
                        userId,
                        postId
                    }
                }),
                ...(post.authorId !==userId ?[
                prisma.notifications.create({
                    data:{
                        type:"LIKE",
                        userId:post.authorId, //recipient of the notification
                        creatorId:userId, // person who liked
                        postId:postId
                    }
                })
                ]
                :[])
            ]);
        }

        revalidatePath("/"); // Revalidate the home page to update like counts
        return {success:true}
    } catch (error) {
        console.log("Error in toggleLike", error);
        return {success:false, error:"Failed to toggle like"}
    }
}

export const createComment = async(postId:string, content:string)=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return;
        if(!content) throw new Error("Content is required");

        const post = await prisma.posts.findUnique({
            where:{id:postId},
            select:{authorId:true}
        });
        if(!post) throw new Error("Post not found");

        const [comment] = await prisma.$transaction(async(pris)=>{
            const newComment = await pris.comments.create({
                data:{
                    content:content,
                    postId:postId,
                    authorId:userId,
                }
            });

            if(post.authorId !== userId){
                await pris.notifications.create({
                    data:{
                        type:"COMMENT",
                        userId:post.authorId,
                        creatorId:userId,
                        postId:postId,
                        commentId:newComment.id
                    }
                })
            }

            return [newComment]
        });
        revalidatePath("/");
        return {success:true, comment}
    } catch (error) {
        console.log("Failed to create comment : ",error);
        return {success:false, error:"Failed to create comment"}
    }
}

export const deletePost = async(postId:string)=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return;

        const post = await prisma.posts.findUnique({
            where:{id:postId},
            select:{authorId:true}
        });
        if(!post) throw new Error("Post not found");
        if(post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

        await prisma.posts.delete({
            where:{id:postId},
        });

        revalidatePath("/");
        return{success:true}

    } catch (error) {
        console.log("Failed to delete post : ",error);
        return {success:true,error:"Failed to delete post"}
    }
}