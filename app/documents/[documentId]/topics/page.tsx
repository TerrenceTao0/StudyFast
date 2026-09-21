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
}


type DocumentData = {
    id: number
    title: string
    topics: TopicData[]
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
            <>
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
            </>
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
                        progress={10}
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

