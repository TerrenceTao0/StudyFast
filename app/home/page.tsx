"use client"

import NavBar from "@/components/navbar"
import { useState } from "react"

//

export default function Home() {
    const documents = []

    function EmptyUpload() {
        return (
            <>
                <div className="w-full h-screen flex justify-center items-center">
                    <button className="transition-all hover:bg-gray-300 w-170 h-100 rounded-sm flex flex-col
                        bg-gray-200 border-black border-1 justify-center items-center cursor-pointer
                    ">
                        <p className="text-[30px] text-gray-700">
                            +
                        </p>

                        <p className="text-gray-500">
                            Upload a pdf, docx, or txt to get started.
                        </p>
                    </button>
                </div>
            </>
        )
    }


    function Document(topic: string) {
        return (
            <>
                <button className={`
                    transition-all hover:bg-primary hover:text-white w-50 h-30 rounded-sm 
                    bg-gray-200 border-black border-1 flex justify-center items-center 
                    cursor-pointer ${topic == "+" && "text-[30px] text-gray-500"}
                `}>
                    {topic}
                </button>
            </>
        )
    }


    function GridLayout() {
        return (
            <>
                <div className="w-full h-screen flex justify-center items-center">
                    <div className="w-200 h-120 mt-15 border-black flex gap-5 border-1 p-5">
                        {Document("+")}
                        
                    </div>
                </div>
            </>
        )
    }


    return (
        <>
            <NavBar />
            {documents.length == 0 ? <EmptyUpload /> : <GridLayout />}
        </>
    )
}

