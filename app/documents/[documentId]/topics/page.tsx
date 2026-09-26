"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

import ProgressBar from "@/components/progressBar"
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
    72,
    0,
    -72
]

//

function Topic({
    topic,
    index,
    isLast,
    documentId
}: {
    topic: TopicData,
    index: number,
    isLast: boolean,
    documentId: string
}) {
    const currentX = positions[index % positions.length]
    const nextX = positions[(index + 1) % positions.length]

    const differenceX = nextX - currentX
    const locked = topic.status == "locked"

    return (
        <div
            className="flex flex-col gap-1.5 relative w-52"
            style={{
                transform: `translateX(${currentX}px)`
            }}
        >
            {!isLast && (
                <div
                    className={`
                        absolute top-20 left-1/2 w-1.5 h-48 rounded-full origin-top
                        ${locked ? "bg-border" : "bg-primary/40"}
                    `}
                    style={{
                        transform: `
                            translateX(-50%)
                            rotate(${differenceX > 0 ? "-22deg" : differenceX < 0 ? "22deg" : "0deg"})
                        `
                    }}
                />
            )}

            <ProgressBar progress={topic.mastery} />

            {locked ? (
                <div className="
                    h-28 rounded-2xl bg-background border-2 border-dashed border-border text-accent/70
                    flex flex-col justify-center items-center text-center px-3 select-none z-2
                ">
                    <p className="font-bold">
                        {topic.name}
                    </p>

                    <span className="text-xs mt-1">
                        Complete the previous topic
                    </span>
                </div>
            ) : (
                <Link
                    href={`/documents/${documentId}/topics/${topic.id}`}
                    className="
                        card h-28 px-3 flex justify-center items-center text-center font-bold z-2
                        border-2 border-primary/30 transition-all
                        hover:-translate-y-1 hover:shadow-lg hover:border-primary hover:text-primary
                    "
                >
                    {topic.name}
                </Link>
            )}
        </div>
    )
}

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


    return (
        <>
            <header className="
                fixed top-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl
                card bg-surface/90 backdrop-blur px-4 py-3 flex items-center gap-4
            ">
                <Link href="/home" className="btn btn-ghost h-9 px-3 shrink-0">
                    ← Back
                </Link>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-sm font-bold truncate">
                        {document?.title}
                    </span>

                    <ProgressBar progress={document?.mastery || 0} />
                </div>
            </header>

            {document && (
                <div className="w-full min-h-screen flex justify-center pt-32 pb-20 overflow-x-hidden">
                    <div className="flex flex-col items-center gap-10">
                        {document.topics.map((topic, index) => (
                            <Topic
                                key={topic.id}
                                topic={topic}
                                index={index}
                                isLast={index==document.topics.length-1}
                                documentId={documentId}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
