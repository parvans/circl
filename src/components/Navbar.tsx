import Link from 'next/link'
import React from 'react'
import DesktopNav from './DesktopNav'
import MobileNav from './MobileNav'
import { currentUser } from '@clerk/nextjs/server'
import { syncUser } from '@/actions/user.action'
import { Input } from './ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { SearchIcon } from 'lucide-react'

export default async function Navbar() {
    const user = await currentUser();
    if(user){
        await syncUser(); 
    }
  return (
    <nav className='sticky top-0 w-full border-b bg-background/95 backdrop-blur 
    supports-backdrop-filter:bg-background/60 z-50'>
        <div className='max-w-7xl m-auto px-4'>
            <div className='flex items-center justify-between h-16'>
                <div className='flex items-center'>
                    <Link href="/" className='text-xl font-bold text-primary font-mono tracking-wide'>
                        Circl
                    </Link>
                </div>
                {/* searchbar */}
                <div className="flex-1 max-w-md mx-4">
                   <InputGroup>
                   <InputGroupInput placeholder="Search Circl..." />
                   <InputGroupAddon align={"inline-start"}>
                    <SearchIcon className="w-4 h-4 text-muted-foreground" />
                   </InputGroupAddon>
                   </InputGroup>
                </div>
                <DesktopNav/>
                <MobileNav/>
            </div>
        </div>
    </nav>
  )
}
