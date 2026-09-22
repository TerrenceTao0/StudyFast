"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import { ProgressBar } from "@/components/progressBar"
import { getDocument } from "@/lib/document"
 
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

const positions = [
    0,
    96,
    0,
    -96
]

//

export default function Home() { 
    const params = useParams()
    const documentId = params.documentId as string

    const [document, setDocument] = useState<DocumentData>()

    // Check user's uploaded documents at the start of page mount
    useEffect(() => {
        async function get() {
            const data = await getDocument(documentId)
            
            if (data) {
                setDocument(data)
            }
        }


        get()
    }, [])

    
    function Topic({
        topic,
        index,
        isLast
    }: {
        topic: TopicData,
        index: number,
        isLast: boolean
    }) {
        const currentX = positions[index % positions.length]
        const nextX = positions[(index + 1) % positions.length]

        const differenceX = nextX - currentX

        return (
            <div 
                className="flex flex-col gap-0.5 relative"
                style={{
                    transform: `translateX(${currentX}px)`
                }}
            >
                {!isLast && (
                    <div
                        className={`
                            absolute top-20 left-1/2 w-1 h-40 bg-gray-300 
                            origin-top ${topic.status == "unlocked" && "border-black border-1"}
                        `}
                        style={{
                            transform: `
                                translateX(-50%)
                                rotate(${differenceX > 0 ? "-35deg" : differenceX < 0 ? "35deg" : "0deg"})
                            `
                        }}
                    />
                )}

                <ProgressBar progress={topic.mastery} />

                {topic.status == "locked" ? (
                    <button 
                        className="
                        w-50 h-30 rounded-sm bg-gray-100 border border-gray-300 text-gray-400
                        flex flex-col justify-center items-center text-center cursor-not-allowed
                        select-none z-2
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
                            cursor-pointer relative text-center z-2 
                        "
                    >
                        {topic.name}
                    </Link>
                )}
            </div>
        )
    }


function PathLayout() {
    return (
        <div className="w-full min-h-screen flex justify-center pt-24 pb-20">
            <div className="w-150 flex flex-col items-center gap-10">
                {document?.topics.map((topic, index) => (
                    <Topic
                        key={topic.id}
                        topic={topic}
                        index={index}
                        isLast={index==document.topics.length-1}
                    />
                ))}
            </div>
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
            {document && <PathLayout />}
        </>
    )
}

