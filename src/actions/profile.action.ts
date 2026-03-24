"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

export const getProfileByUser = async(username:string)=>{
    try {
        const user = await prisma.user.findUnique({
            where:{
                username:username
            },
            select:{
                id:true,
                name:true,
                username:true,
                bio:true,
                image:true,
                location:true,
                website:true,
                createdAt:true,
                _count:{
                    select:{
                        followers:true,
                        following:true,
                        posts:true
                    }
                }
            }
        });

        return user;
    
    } catch (error) {
        console.error("Error fetching profile : ", error);
        throw new Error("Failed to fetch profile");
    }
}

export const getUserPosts = async(userId:string)=>{
    try {
        const posts = await prisma.posts.findMany({
            where:{authorId:userId},
            include:{
                author:{
                    select:{
                        id:true,
                        name:true,
                        username:true,
                        image:true,
                    }
                },
                comments:{
                    include:{
                        author:{
                            select:{
                                id:true,
                                name:true,
                                username:true,
                                image:true,
                            }
                        },
                        likes:{
                            select:{
                                userId:true,
                            }
                        }
                    },
                    orderBy:{createdAt:"asc"}
                },
                likes:{
                    select:{
                        userId:true
                    },
                },
                _count:{
                    select:{
                        likes:true,
                        comments:true,
                    },
                },
            },
            orderBy:{createdAt:"desc"}
        });

        return posts;

    } catch (error) {
        console.error("Error fetching user posts : ", error);
        throw new Error("Failed to fetch user posts");
    }
}

export const getUserLikedPosts = async(userId:string)=>{
    try {
       const likedPosts = await prisma.posts.findMany({
        where:{
            likes:{
                some:{
                    userId
                },
            },
        },
        include:{
            author:{
                select:{
                    id:true,
                    name:true,
                    username:true,
                    image:true,
                },
            },
            comments:{
                include:{
                    author:{
                        select:{
                            id:true,
                            name:true,
                            username:true,
                            image:true,
                        },
                    },
                    likes:{
                        select:{
                            userId:true,
                        }
                    },
                },
                orderBy:{createdAt:"asc"}
            },
            likes:{
                select:{
                    userId:true
                }
            },
            _count:{
                select:{
                    likes:true,
                    comments:true
                },
            },
        },
        orderBy:{createdAt:'desc'}
       });

       return likedPosts;
    } catch (error) {
        console.error("Error fetching user liked posts : ", error);
        throw new Error("Failed to fetch user liked posts");
    }
}

export const updateUserProfile = async(formData:FormData)=>{
    try {
        const {userId:clerkId} = await auth();
        if(!clerkId) throw new Error("Unauthorized");
        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;

        const updateUser = await prisma.user.update({
            where:{clerkId},
            data:{
                name,
                bio,
                location,
                website
            }
        });

        revalidatePath(`/profile/${updateUser.username}`);
        return { success: true, updateUser}
    } catch (error) {
        console.error("Error update profile : ", error);
        throw new Error("Failed update profile");
    }
}

export const isFollowing = async(userId:string)=>{
    try {
        const currentUserId = await getDbUserId();
        if(!currentUserId) return false;
        
        const follow = await prisma.follows.findUnique({
            where:{
                followerId_followingId:{
                    followerId:currentUserId,
                    followingId:userId
                }
            }
        });
         
        return !! follow;
    } catch (error) {
        console.error("Error checking follow status : ", error);
        throw new Error("Failed checking follow status");
    }
}
