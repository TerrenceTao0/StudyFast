"use client"

import NavBar from "@/components/navbar"
import { redirect } from "next/navigation"

//

export default function Account() {
    async function logout() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        )


        if (response.ok) {
            redirect("/")
        }
    }


    return (
        <>
            <NavBar />

            <div className="w-full h-screen flex items-center justify-center">
                <div className="w-70 h-100 bg-white border-black border-1 flex flex-col justify-center items-center">
                    <button 
                        className="button transition-all !bg-red-500"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}

