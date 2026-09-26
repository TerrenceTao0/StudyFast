"use client"

import NavBar from "@/components/navbar"
import { useRouter } from "next/navigation"

//

export default function Account() {
    const router = useRouter()

    async function logout() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        )


        if (response.ok) {
            router.push("/")
        }
    }


    return (
        <>
            <NavBar />

            <div className="w-full min-h-screen flex items-center justify-center p-6">
                <div className="card w-full max-w-sm p-7 flex flex-col gap-6">
                    <h1 className="text-2xl font-extrabold">
                        Account
                    </h1>

                    <button
                        className="btn btn-danger w-full"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}
