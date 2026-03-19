"use client"
import { getNotifications, markNotificationAsRead } from '@/actions/notification.action';
import { useNotificationRealtime } from '@/components/NotificationRealtimeProvider';
import NotificationSkeleton from '@/components/NotificationSkeleton'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircleIcon, UserPlusIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

type Notifications = Awaited<ReturnType<typeof getNotifications>>
type Notification = Notifications[number]

const getNotificationIcon = (type:string)=>{
    switch(type){
        case "LIKE":
            return <Heart className='size-4 text-red-400' />;
        case "COMMENT":
            return <MessageCircleIcon className='size-4 text-blue-500' />;
        case "FOLLOW":
            return <UserPlusIcon className='size-4 text-green-500' />;
        default:
            return null;
    }
}

const NotificationPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { refreshNotifications, setUnreadCount } = useNotificationRealtime();

    useEffect(()=>{
        const fetchNotifications = async()=>{
            setIsLoading(true);
            try {
                const data = await getNotifications();
                const normalizedNotifications = data.map((notification)=>({
                    ...notification,
                    read:true,
                }));
                setNotifications(normalizedNotifications);
                const unReadIds = data.filter(n => !n.read).map(n => n.id);
                if(unReadIds.length > 0){
                    await markNotificationAsRead(unReadIds);
                    setUnreadCount(0);
                    await refreshNotifications();
                }

            } catch (error) {
                toast.error("Failed to fetch notifications")
            }finally{
                setIsLoading(false)
            }
        }
        fetchNotifications()
        const interval = window.setInterval(fetchNotifications, 5000);

        return () => window.clearInterval(interval);
    },[refreshNotifications, setUnreadCount])

    if(isLoading) return <NotificationSkeleton/>
  return (
    <div className="space-y-4">
        <Card>
            <CardHeader className='border-b'>
                <div className="flex items-center justify-between">
                    <CardTitle>Notifications</CardTitle>
                    <span>
                        {notifications.filter(n=> !n.read).length} unread
                    </span>
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                <ScrollArea className='h-calc(100vh-12rem)'>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
                    ):(
                        notifications.map((notification)=>(
                            <div 
                            key={notification.id}
                            className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                                !notification.read ? "bg-muted/50" : ""
                            }`}
                            >
                                <Avatar>
                                    <AvatarImage src={notification.creator.image ?? "/avatar.png"} />
                                </Avatar>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        {getNotificationIcon(notification.type)}
                                        <span>
                                            <span className='font-medium'>
                                                {notification.creator.name ?? notification.creator.username}
                                            </span>{" "}
                                            {notification.type === "FOLLOW" 
                                            ? "started to following you" 
                                            : notification.type === "LIKE" 
                                            ? "liked your post" 
                                            : "commented on your post"
                                            }
                                        </span>
                                    </div>

                                    {notification.post && (
                                        notification.type === "LIKE" || notification.type === "COMMENT" && (
                                            <div className="pl-6 space-y-2">
                                                <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                                    <p>{notification.post.content}</p>
                                                    {notification.post.image && (
                                                        <img 
                                                        src={notification.post.image} 
                                                        alt="Post content"
                                                        className='mt-2 rounded-md w-full max-w-50 h-auto object-cover' 
                                                        />
                                                    )}
                                                </div>

                                                {notification.type === "COMMENT" && notification.comment && (
                                                    <div className="text-sm p-2 bg-accent/50 rounded-md">
                                                        {notification.comment.content}
                                                    </div>
                                                )}

                                                <p className='text-sm text-muted-foreground pl-6'>
                                                    {formatDistanceToNow(new Date(notification.createdAt), {addSuffix:true})}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>
                        ))
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  )
}

export default NotificationPage
