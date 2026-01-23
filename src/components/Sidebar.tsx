import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SignInButton } from '@clerk/nextjs';
import { Button } from './ui/button';
import { getUserByClerkId } from '@/actions/user.action';
import Link from 'next/link';
import { Avatar, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { LinkIcon, MapPinIcon } from 'lucide-react';


export default async function Sidebar() {
    const authUser = await currentUser();
    if(!authUser) return <SignupSigninSidebar/>;

    const user = await getUserByClerkId(authUser.id);
    if(!user) return null;

    //console.log(user);
    
  return (
    <div className='sticky top-20'>
      <Card>
        <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center'>
                <Link 
                    href={`/profile/
                        ${authUser.username ?? authUser.emailAddresses[0].emailAddress.split("@")[0]}`
                    }
                    className='flex flex-col items-center justify-center'
                    >
                    <Avatar className='w-20 h-20 border-2'>
                        <AvatarImage src={user.image || "/avatar.png"}/>
                    </Avatar>

                    <div className='mt-4 space-y-1'>
                        <h3 className='font-semibold'>
                            {user.name}
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                            {user.username}
                        </p>
                    </div>
                </Link>

                {user.bio && <p className='text-sm text-muted-foreground'>{user.bio}</p>}

                <div className="w-full">
                    <Separator className='my-4'/>
                    <div className='flex justify-between'>
                        <div>
                            <p className='font-medium'>{user._count.following}</p>
                            <p className='text-xs text-muted-foreground'>Following</p>
                        </div>
                        <Separator orientation='vertical'/>
                        <div>
                            <p className='font-medium'>{user._count.followers}</p>
                            <p className='text-xs text-muted-foreground'>Followers</p>
                        </div>
                    </div>
                    <Separator className='my-4'/>
                </div>  
                <div className="w-full space-y-2 text-sm">
                    <div className='flex items-center text-muted-foreground'>
                        <MapPinIcon className='w-4 h-4 mr-2'/>
                        {user.location || "No location"}
                    </div>
                    <div className='flex items-center text-muted-foreground'>
                        <LinkIcon className='w-4 h-4 mr-2 shrink-0'/>
                        {user.website ? (
                            <a href={`${user.website}`} className='hover:underline truncate' target='_blank'>
                                {user.website}
                            </a>
                        ):("No website")
                        }
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

const SignupSigninSidebar=()=>{
    return (
        <div className="sticky top-20">
            <Card>
                <CardHeader>
                    <CardTitle className='text-xl text-center font-semibold'>
                        Welcome Back!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-center text-muted-foreground mb-4'>
                        Login to access your profile and connect to others.
                    </p>
                    <SignInButton mode='modal'>
                        <Button className='w-full' variant={"outline"}>
                            Login
                        </Button>
                    </SignInButton>
                    <SignInButton mode='modal'>
                        <Button className='w-full mt-2' variant={"default"}>
                            Sign Up
                        </Button>
                    </SignInButton>
                </CardContent>
            </Card>
        </div>
    )
}



