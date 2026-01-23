import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { getRandomUsers } from '@/actions/user.action'
import Link from 'next/link';
import { Avatar } from './ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import FollowButton from './FollowButton';

export default async function UserFollow() {
    const users = await getRandomUsers();
    if(users.length === 0){
        return (
            <Card>
                <CardContent>
                    <CardTitle>Who to follow</CardTitle>
                    <p className="text-sm text-gray-500 mt-4">No user suggestions available</p>
                </CardContent>
            </Card>
        )
    }
  return (
    <Card>
       <CardHeader>
            <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
            <div className='space-y-4'>
                {users.map((user)=>(
                    <div key={user.id} className='flex gap-2 items-center justify-between'>
                        <div className='flex items-center gap-1'>
                            <Link href={`/profile/${user.username}`}>
                                <Avatar className='w-10 h-10'>
                                    <AvatarImage src={user.image ?? "/avatar.png"} />
                                </Avatar>
                            </Link>
                            <div className='text-xs'>
                                <Link href={`/profile/${user.username}`} className='font-medium cursor-pointer'>
                                    {user.name}
                                </Link>
                                <p className='text-muted-foreground'>@{user.username}</p>
                                <p className='text-muted-foreground'>{user._count.followers} followers</p>
                            </div>
                        </div>
                       <FollowButton userId={user.id}/>  
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  )
}
