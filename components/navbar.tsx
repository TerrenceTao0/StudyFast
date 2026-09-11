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
            ml-5 border-1 border-white w-30 h-10 rounded-[20px] transition-all cursor-pointer
            hover:text-black hover:bg-white
        ">
            {children}
        </Link>
    )
}

//

export default function NavBar() {
    return (
        <div className="justify-center items-center flex mt-12">
            <nav className="w-120 h-12 rounded-md flex justify-center items-center absolute">
                <NavButton href="/admin">Orgs</NavButton>
                <NavButton href="/account">Account</NavButton>
                <NavButton href="/settings">Settings</NavButton>
            </nav>
        </div>
    )
}

