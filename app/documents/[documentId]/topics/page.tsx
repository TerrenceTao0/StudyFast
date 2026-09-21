"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { ProgressBar } from "@/components/progressBar"
 
//

type TopicData = {
    id: number
    name: string
    order_index: number
    mastery: number
    status: string
}


type DocumentData = {
    title: string
    topics: TopicData[]
    mastery: number
}

//

export default function Home() { 
    const params = useParams()
    const documentId = params.documentId as string

    const [document, setDocument] = useState<DocumentData>()

    // Check user's uploaded documents at the start of page mount
    useEffect(() => {
        getDocument()
    }, [])

    
    async function getDocument() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
            {
                "credentials": "include"
            }
        ) 


        if (!response.ok) {
            return 
        }


        const data = await response.json()
        setDocument(data)
    }
       

    function Topic({
        topic
    }: {
        topic: TopicData
    }) {
        return (
            <div className="flex flex-col gap-0.5">
                <ProgressBar progress={topic.mastery} />

                {topic.status == "locked" ? (
                    <button 
                        className="
                        w-full h-30 rounded-sm bg-gray-100 border border-gray-300 text-gray-400
                        flex flex-col justify-center items-center text-center cursor-not-allowed
                        select-none
                    ">
                        <p>
                            {topic.name}
                        </p>

                        <span className="text-xs mt-2 text-gray-400">
                            Complete the previous topic
                        </span>
                    </button>
                ): (
                    <Link 
                        href={`/documents/${documentId}/topics/${topic.id}`}
                        className="
                            transition-all hover:bg-primary hover:text-white w-50 h-30 rounded-sm 
                            bg-gray-200 border-black border-1 flex justify-center items-center 
                            cursor-pointer relative text-center
                        "
                    >
                        {topic.name}
                    </Link>
                )}
            </div>
        )
    }


    function GridLayout() {
        return (
            <>
                <div className="w-full min-h-screen flex pt-20 pb-5 justify-center items-start">
                    <div className="
                        w-220 border-black grid grid-cols-4 
                        gap-5 border-1 p-2 content-start min-h-120
                    ">
                        {document?.topics.map((topic) => (
                            <Topic 
                                key={topic.id}
                                topic={topic}
                            />
                        ))}
                    </div>
                </div>
            </>
        )
    }


    function GoBack() {
        return (
            <div className="absolute w-full min-h-screen flex mt-8">
                <Link 
                    href="/home"
                    className="button translate-x-47 transition-all"
                >
                    Back
                </Link>
            </div>
        )
    }


    function Header() {
        return (
            <div className="w-full flex justify-center absolute mt-3">
                <div className="w-220">
                    <div className="flex items-center justify-between mb-1">
                        <Link
                            href="/home"
                            className="
                                px-5 py-2
                                bg-foreground text-white
                                rounded-md
                                transition-all
                                hover:bg-primary
                            "
                        >
                            Back
                        </Link>
                    </div>

                    <ProgressBar
                        progress={document?.mastery || 0}
                        className="w-full"
                    />
                </div>
            </div>
        )
    }


    return (
        <>
            <Header />
            {document && <GridLayout />}
        </>
    )
}

