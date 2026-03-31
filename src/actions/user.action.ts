"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";
import { cache } from "react";

const currentUserSelect = {
    id: true,
    clerkId: true,
    name: true,
    username: true,
    email: true,
    image: true,
    bio: true,
    location: true,
    website: true,
    _count: {
        select: {
            followers: true,
            following: true,
            posts: true,
        }
    }
} as const;

export const getCurrentDbUser = cache(async () => {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            },
            select: currentUserSelect,
        });

        if (existingUser) {
            return existingUser;
        }

        const user = await currentUser();
        if (!user) return null;

        const fallbackUsername = user.emailAddresses[0].emailAddress.split("@")[0];

        return prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || fallbackUsername,
                username: user.username ?? fallbackUsername,
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl
            },
            select: currentUserSelect,
        });
    } catch (error) {
        console.log("Error in getCurrentDbUser", error);
        return null;
    }
});

export const syncUser = async()=>{
    try {
        return await getCurrentDbUser();
    } catch (error) {
        console.log("Error in syncUser", error);
        return null;
    }
}

export const getUserByClerkId = async(clerkId:string)=>{
    return prisma.user.findUnique({
        where:{
            clerkId,
        },
        include:{
            _count:{
                select:{
                    followers:true,
                    following:true,
                    posts:true
                }
            }
        }
    })
}

export const getDbUserId = cache(async()=>{
    const user = await getCurrentDbUser();
    if(!user) return null;
    return user.id
})

export const getRandomUsers = async()=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return [];

        const randomUsers = await prisma.user.findMany({
            where:{
                AND:[
                    {NOT:{id:userId}}, // Exclude current user
                    {NOT:{followers:{some:{followerId:userId}}}} // Exclude users already followed
                ]
            },
            select:{
                id:true,
                name:true,
                username:true,
                image:true,
                _count:{
                    select:{
                        followers:true,
                    }
                }
            },
            take:3,
        });
        return randomUsers;
    } catch (error) {
        console.log("Error in getRandomUsers", error);
        return [];
    }
}

export const searchUsers = async (rawQuery: string) => {
    try {
        const query = rawQuery.trim();
        if (query.length < 2) return [];

        return prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        email: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                        posts: true,
                    },
                },
            },
            take: 5,
            orderBy: {
                username: "asc",
            },
        });
    } catch (error) {
        console.log("Error in searchUsers", error);
        return [];
    }
}

export const toggleFollow = async(targetUserId:string)=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return;
        
        if(userId === targetUserId) throw new Error("Cannot follow yourself");

        const existingFollow = await prisma.follows.findUnique({
            where:{
                followerId_followingId:{
                    followerId:userId,
                    followingId:targetUserId
                }
            }
        });

        if(existingFollow){
            await prisma.follows.delete({
                where:{
                    followerId_followingId:{
                        followerId:userId,
                        followingId:targetUserId
                    }
                }
            });
        }else{
            await prisma.$transaction([
                prisma.follows.create({
                    data:{
                        followerId:userId,
                        followingId:targetUserId
                    }
                }),
                prisma.notifications.create({
                    data:{
                        type:"FOLLOW",
                        userId:targetUserId,
                        creatorId:userId
                    }
                })
            ]);
        }
        revalidatePath("/");
        return {success:true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return {success:false, error:"Failed to toggle follow"};
    }
}
