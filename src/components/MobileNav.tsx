"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { SignInButton, SignOutButton, useAuth } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { BellIcon, HomeIcon, LogOutIcon, MenuIcon, MoonIcon, SunIcon, UserIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import Link from 'next/link';

export default function MobileNav() {
  const [showMenu,setShowMenu] = useState(false);
  const {isSignedIn} = useAuth();
  const {theme,setTheme} = useTheme();
  return (
    <div className='flex md:hidden items-center space-x-2'>
      <Button
      variant="ghost"
      size="icon"
      onClick={()=>setTheme(theme === "dark" ? "light" : "dark")}

      >
        <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0'/>
        <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'/>
        <span className='sr-only'>Toggle Theme</span>
      </Button>

      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <MenuIcon className='w-5 h-5'/>
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='w-75'>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className='flex flex-col space-y-4 mt-6'>
            <Button variant={"ghost"} className='flex items-center gap-3 justify-start' asChild>
              <Link href={"/"} >
                <HomeIcon className='w-4 h-4'/>
                Home
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button variant={"ghost"} className='flex items-center gap-3 justify-start' asChild>
                  <Link href={"/notifications"} >
                    <BellIcon className='w-4 h-4'/>
                    Notifications
                  </Link>
                </Button>

                <Button variant={"ghost"} className='flex items-center gap-3 justify-start' asChild>
                  <Link href={"/profile"} >
                    <UserIcon className='w-4 h-4'/>
                    Profile
                  </Link>
                </Button>
                <SignOutButton>
                  <Button variant={"ghost"} className='flex items-center gap-3 justify-start w-full'>
                    <LogOutIcon className='w-4 h-4'/>
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ):(
              <SignInButton mode='modal'>
                    <Button variant="default" className='w-full'>
                      Sign In
                    </Button>
                </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
