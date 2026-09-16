import Link from "next/link"

//

type NavButtonProps = {
    href: string
    children: React.ReactNode
}

//

function NavButton({ href, children }: NavButtonProps) {
    return (
        <Link href={href} className="
            flex justify-center items-center
            border-1 border-black w-30 h-8 rounded-[10px] transition-all cursor-pointer
            hover:text-white hover:bg-primary
        ">
            {children}
        </Link>
    )
}

//

export default function NavBar() {
    return (
        <div className="justify-center items-center w-full flex absolute bg-white border-black border-1">
            <nav className="w-120 h-12 rounded-md flex gap-5 justify-center items-center">
                <NavButton href="/admin">Home</NavButton>
                <NavButton href="/account">Account</NavButton>
                <NavButton href="/settings">Settings</NavButton>
            </nav>
        </div>
    )
}

