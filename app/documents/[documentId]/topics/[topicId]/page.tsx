"use client"

import { useParams } from "next/navigation"
import { ProgressBar } from "@/components/progressBar"
import { useEffect, useState } from "react"
import Link from "next/link"

import { getDocument } from "@/lib/document"

//

type Flashcard = {
    id: number
    front: string
    back: string
}

type DocumentData = {
    title: string
    mastery: number
}

type Data = {
    completion: number, 
    soonest_due: string
}

//

function FlashcardText({ text }: { text: string }) {
    const regex = /\[\[([^|\]]+)\|([^\]]+)\]\]/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(text)) !== null) {
        // Add normal text before the special word
        parts.push(
            text.slice(lastIndex, match.index)
        )

        const nativeText = match[1]
        const romanization = match[2]

        parts.push(
            <ruby key={match.index}>
                {`"${romanization}"`}
                <rt className="text-sm">
                    {nativeText}
                </rt>
            </ruby>
        )

        lastIndex = regex.lastIndex
    }

    // Add whatever normal text remains afterwards
    parts.push(
        text.slice(lastIndex)
    )

    return (
        <span className="whitespace-pre-wrap">
            {parts}
        </span>
    )
}


export default function Topic() {
    const params = useParams()
    const documentId = params.documentId as string 
    const topicId = params.topicId as string 

    const [document, setDocument] = useState<DocumentData>()
    const [state, setState] = useState("hidden")
    const [currentCard, setCurrentCard] = useState<Flashcard>()
    const [data, setData] = useState<Data>()
    const [breakTimeLeft, setBreakTimeLeft] = useState("")

    useEffect(() => {
        async function get() {
            const data = await getDocument(documentId)
            
            if (data) {
                setDocument(data)
            }
        }


        get()
    }, [])


    useEffect(() => {
        getFlashcard()
    }, [])


    useEffect(() => {
        if (!data) {
            return 
        }


        function calcBreakTime() {
            const now = Date.now()
            const due = new Date(data!.soonest_due).getTime()
            const timeLeft = Math.round((due - now) / 1000)
            
            if (timeLeft < 0) {
                setBreakTimeLeft("00:00:00")
            }


            const hours = Math.floor(timeLeft / 3600)
            const minutes = Math.floor((timeLeft % 3600) / 60)
            const seconds = timeLeft % 60

            setBreakTimeLeft(
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`
            )
        }


        calcBreakTime()

        const interval = setInterval(calcBreakTime, 1000)

        return () => clearInterval(interval)
    }, [data])


    async function getFlashcard() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/flashcards/${topicId}`,
                {
                    credentials: "include"
                }
            )


            if (response.ok) {
                const json = await response.json() 

                if (!("state" in json)) {
                    setCurrentCard(undefined)
                    setData(undefined)

                    return 
                }


                const responseState = json["state"]
                
                if (responseState == "card") {
                    setCurrentCard(json)
                }
                else if (responseState == "break") {
                    setCurrentCard(undefined)
                    setData(json)
                }
                else if (responseState == "complete") {
                    setCurrentCard(undefined)
                }
            } 
        }
        catch {

        }
    }


    async function review(answer: string) {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/flashcards/${currentCard!.id}/review`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        response: answer
                    })
                }
            )
        }
        catch {

        }


        await getFlashcard()
        setState("hidden")
    }


    function FlashcardTask() {
        return (
            <>
                <div 
                    className="
                        w-full h-full absolute flex flex-col gap-5 items-center justify-center
                ">
                    <div 
                        className="
                            w-150 h-80 bg-white flex items-center justify-center
                            border-black border-1 rounded-sm text-center p-5"
                        >
                       <FlashcardText
                            text={
                                state == "hidden"
                                    ? currentCard!.front
                                    : currentCard!.back
                            }
                        />
                    </div>

                    {state == "hidden" ? (
                        <button 
                            className="button transition-all"
                            onClick={() => setState("shown")}
                        >
                            Answer
                        </button>
                    ) : (
                        <div className="flex gap-5">
                            <button 
                                className="button transition-all !bg-red-500"
                                onClick={() => review("again")}
                            >
                                Forgot
                            </button>

                            <button 
                                className="button transition-all !bg-green-500"
                                onClick={() => review("good")}
                            >
                                Remembered
                            </button>
                        </div>
                    )}
                </div>
            </>
        )
    }


    function RestingPeriod() {
        return (
            <div className="absolute flex justify-center items-center w-full h-full">
                <div 
                    className="
                        border-black border-1 w-150 h-80 bg-white flex items-center justify-center
                        flex-col 
                ">
                    <span className="text-[30px]">
                        Break Time
                    </span>

                    <span className="text-[20px]">
                        {breakTimeLeft}
                    </span>

                    <Link 
                        href={`/documents/${documentId}/topics`}
                        className="button transition-all mt-5"
                    >
                        Back
                    </Link>
                </div>
            </div>
        )
    }


    return (
        <div className="relative min-h-screen flex justify-center">
            {currentCard ? (
                <FlashcardTask />
            ) : data && (
                <>
                    <ProgressBar progress={data.completion || 0} className="w-150 mt-28" />
                    <RestingPeriod />
                </>
            )}
        </div>
    )
}

