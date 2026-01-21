import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import ModeToggle from './ModeToggle';
import { Button } from './ui/button';
import Link from 'next/link';
import { BellIcon, HomeIcon, UserIcon } from 'lucide-react';
import { SignInButton, UserButton } from '@clerk/nextjs';

export default async function DesktopNav() {
    const user = await currentUser();
    console.log("User is here : ", user);
    
  return (
    <div className='hidden md:flex items-center space-x-4'>
        <ModeToggle />

        <Button variant="ghost" className='flex items-center gap-2'  asChild>
            <Link href="/">
                <HomeIcon className='w-4 h-4'/>
                <span className='hidden lg:inline'>Home</span>
            </Link>
        </Button>

        {
            user ? (
                <>
                    <Button variant="ghost" className='flex items-center gap-2'  asChild>
                        <Link href="/notifications">
                            <BellIcon className='w-4 h-4'/>
                            <span className='hidden lg:inline'>Notificatios</span>
                        </Link>
                    </Button>
                    <Button variant="ghost" className='flex items-center gap-2'  asChild>
                        <Link href={`/profile/${
                            user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                        }`}>
                            <UserIcon className='w-4 h-4'/>
                            <span className='hidden lg:inline'>Profile</span>
                        </Link>
                    </Button>
                    <UserButton/>
                </>
            ):(
                <SignInButton>
                    <Button variant="default">Sign In</Button>
                </SignInButton>
            )
        }
    </div>
  )
}
