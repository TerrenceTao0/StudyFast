"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

//

type NavButtonProps = {
    href: string
    children: React.ReactNode
}

//

function NavButton({ href, children }: NavButtonProps) {
    const active = usePathname().startsWith(href)

    return (
        <Link href={href} className={`
            flex justify-center items-center h-9 px-4 rounded-xl text-sm font-bold transition-all
            ${active ? "bg-primary-soft text-primary" : "text-accent hover:text-foreground hover:bg-background"}
        `}>
            {children}
        </Link>
    )
}

//

export default function NavBar() {
    return (
        <nav className="
            fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl h-14 px-3
            flex items-center justify-between card rounded-2xl backdrop-blur bg-surface/90
        ">
            <Link href="/home" className="text-lg font-extrabold pl-2">
                Study<span className="text-primary">Fast</span>
            </Link>

            <div className="flex gap-1">
                <NavButton href="/home">Home</NavButton>
                <NavButton href="/account">Account</NavButton>
            </div>
        </nav>
    )
}
