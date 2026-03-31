import React from 'react'
import ModeToggle from './ModeToggle';
import { Button } from './ui/button';
import Link from 'next/link';
import { HomeIcon, UserIcon } from 'lucide-react';
import { SignInButton, UserButton } from '@clerk/nextjs';
import NotificationBell from './NotificationBell';

type DesktopNavProps = {
    isSignedIn: boolean;
    profileHref?: string;
}

export default function DesktopNav({ isSignedIn, profileHref }: DesktopNavProps) {
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
            isSignedIn ? (
                <>
                    <NotificationBell label="Notifications" />
                    <Button variant="ghost" className='flex items-center gap-2'  asChild>
                        <Link href={profileHref ?? "/"}>
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
