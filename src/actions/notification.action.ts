"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export const getNotifications = async()=>{
    try {
        const userId = await getDbUserId();
        if(!userId) return [];

        const notifications = await prisma.notifications.findMany({
            where:{
                userId
            },
            include:{
                creator:{
                    select:{
                        id:true,
                        name:true,
                        username:true,
                        image:true,
                    }
                },
                post:{
                    select:{
                        id:true,
                        content:true,
                        image:true,
                    }
                },
                comment:{
                    select:{
                        id:true,
                        content:true,
                        createdAt:true,
                    }
                }
            },
            orderBy:{
                createdAt:"desc"
            }
        });
        return notifications;

    } catch (error) {
        console.error("Error Fetching Notifications:", error);
        throw new Error("Failed to  fetch notifications")
        
    }
}

export const markNotificationAsRead = async(notificationIds: string[])=>{
    try {
        await prisma.notifications.updateMany({
            where:{
                id:{
                    in:notificationIds
                }
            },
            data:{
                read:true
            }
        });

        return { success:true };

    } catch (error) {
        console.error("Error Marking Notifications:", error);
        return { success:false };
    }
}