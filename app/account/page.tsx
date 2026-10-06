"use client"

import NavBar from "@/components/navbar"
import StreakCalendar from "@/components/streakCalendar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

//

export default function Account() {
    const router = useRouter()
    
    const [days, setDays] = useState([])

    async function logout() {
        const response = await fetch(
            `/api/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        )


        if (response.ok) {
            router.push("/")
        }
    }


    useEffect(() => {
        async function getActivity() {
            try {
                const response = await fetch("/api/auth/activity")
                const json = await response.json()

                if (response.ok) {
                    setDays(json.days)
                }
            }
            catch {

            }
        }


        getActivity()
    }, [])


    return (
        <>
            <NavBar />

            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-6 p-6 pt-24">
                <StreakCalendar days={days} />

                <div className="card w-full max-w-sm p-7 flex flex-col gap-6">
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
