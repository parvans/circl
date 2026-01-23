"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server"

export const syncUser = async()=>{
    try {
        const {userId} = await auth();
        const user = await currentUser();
        if(!userId || !user) return;

        // check the user exist or not
        const existingUser = await prisma.user.findUnique({
            where:{
                clerkId:userId
            }
        });

        if(existingUser){
            return existingUser;
        }

        const dbUser = await prisma.user.create({
            data:{
                clerkId:userId,
                name:`${user.firstName || ""} ${user.lastName || ""}`,
                username:user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email:user.emailAddresses[0].emailAddress,
                image:user.imageUrl
            }
        });

        return dbUser;
    } catch (error) {
        console.log("Error in syncUser", error);
        
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

export const getDbUserId =async()=>{
    const {userId:clerkId} = await auth();
    if(!clerkId) throw new Error("Unauthorized");

    const user = await getUserByClerkId(clerkId);
    if(!user) throw new Error("User not found");
    return user.id
}

export const getRandomUsers = async()=>{
    try {
        const userId = await getDbUserId();
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

export const toggleFollow = async(targetUserId:string)=>{
    try {
        const userId = await getDbUserId();
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

        return {success:true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return {success:false, error:"Failed to toggle follow"};
    }
}