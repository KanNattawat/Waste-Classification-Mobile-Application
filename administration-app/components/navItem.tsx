'use client'

import React from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
type navItem = {
    href: string,
    children: React.ReactNode
}

const NavItem = ({ href, children }: navItem) => {
    const path = usePathname()
    const count = path.split("/").length - 1;
    const itemHref = href.split('?')[0] 
    const isActive = count <= 1 ? path === itemHref :  path.split('/').slice(0, 2).join('/') === itemHref
    return (
        <Link href={href}>
            <div className="group relative flex flex-row items-center justify-start pl-6  gap-3 h-14 hover:bg-[#2C2C2C] transition cursor-pointer">
                <div className={`${isActive ? 'bg-[#1E8B79]' : 'bg-transparent'} transition-all rounded-r-lg absolute left-0 w-1 h-8  group-hover:bg-[#1E8B79]`}>
                </div>
                {children}
            </div>
        </Link>
    )
}

export default NavItem