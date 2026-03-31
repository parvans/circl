import Link from 'next/link'
import React, { Suspense } from 'react'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'
import { getCurrentDbUser } from '@/actions/user.action'
import SearchBar from './SearchBar'

type NavbarProps = {
    user: Awaited<ReturnType<typeof getCurrentDbUser>>;
}

export default function Navbar({ user }: NavbarProps) {
    const profileHref = user ? `/profile/${user.username}` : undefined;

  return (
    <nav className='sticky top-0 w-full border-b bg-background/95 backdrop-blur 
    supports-backdrop-filter:bg-background/60 z-60'>
        <div className='max-w-7xl m-auto px-4'>
            <div className='flex items-center justify-between h-16'>
                <div className='flex items-center'>
                    <Link href="/" className='text-xl font-bold text-primary font-mono tracking-wide'>
                        Circl
                    </Link>
                </div>
                {/* searchbar */}
                <div className="flex-1 max-w-md mx-4">
                   <Suspense fallback={<div className="h-10 w-full rounded-xl border bg-background/70" aria-hidden="true" />}>
                     <SearchBar />
                   </Suspense>
                </div>
                <DesktopNav isSignedIn={!!user} profileHref={profileHref} />
                <MobileNav isSignedIn={!!user} profileHref={profileHref} />
            </div>
        </div>
    </nav>
  )
}
