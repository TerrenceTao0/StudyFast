"use client"

import { useParams } from "next/navigation"
import ProgressBar from "@/components/progressBar"
import { useEffect, useState } from "react"
import Link from "next/link"

import { getDocument } from "@/lib/document"

//

type Flashcard = {
    id: number
    front: string
    back: string
}

type TopicData = {
    id: number
    name: string
    mastery: number
    status: string
}

type DocumentData = {
    title: string
    mastery: number
    topics: TopicData[]
}

type Data = {
    completion: number, 
    soonest_due: string
}

type QuestionData = {
    id: number,
    question: string, 
    options: string[],
    difficulty: string 
}

type QuestionResponse = {
    correct: boolean, 
    answer: string,
    explanation: string, 
    mastery: number
}

//

function LabeledText({ text }: { text: string }) {
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


    // States - flashcards, questions, complete
    const [state, setState] = useState("flashcards")

    // Card states - hidden, shown
    const [cardState, setCardState] = useState("hidden")

    const [document, setDocument] = useState<DocumentData>()
    const [currentCard, setCurrentCard] = useState<Flashcard>()
    const [breakData, setBreakData] = useState<Data>()
    const [breakTimeLeft, setBreakTimeLeft] = useState<string>("")

    const [questions, setQuestions] = useState<QuestionData[]>()
    const [currentQuestion, setCurrentQuestion] = useState<number>(0)
    const [questionResponse, setQuestionResponse] = useState<QuestionResponse>()
    const [selectedAnswer, setSelectedAnswer] = useState("")

    useEffect(() => {
        async function get() {
            const data = await getDocument(documentId)
            
            if (data) {
                setDocument(data)
            }
        }


        get()
    }, [])


    {/* 
        getFlashcard also checks if user has finished flashcard tasks. 
        If user has finished flashcard tasks, question task will start.
    */}
    useEffect(() => {
        getFlashcard()
    }, [])


    useEffect(() => {
        if (state == "questions") { 
            getQuestions()
        }
    }, [state])


    {/* Client calculated break timer that switches back to showing flashcards after period ends. */}
    useEffect(() => {
        if (!breakData) {
            return 
        }


        function calcBreakTime() {
            const now = Date.now()
            const due = new Date(breakData!.soonest_due).getTime()
            const timeLeft = Math.round((due - now) / 1000)
            
            if (timeLeft < 0) {
                setBreakTimeLeft("")
                setBreakData(undefined)
                getFlashcard()

                return 
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
    }, [breakData])


    async function submitAnswer(user_answer: string) {
        if (selectedAnswer != "" && !questionResponse?.correct) {
            setQuestionResponse(undefined)
            setSelectedAnswer("")
            setCurrentQuestion(Math.min(questions!.length - 1, currentQuestion + 1))

            return 
        }


        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/questions/${topicId}/${questions![currentQuestion].id}/answer`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_answer
                    })
                }
            )


            if (response.ok) {
                const json = await response.json()
                setQuestionResponse(json)
                setSelectedAnswer(user_answer)

                if (json.correct) {
                    new Audio("/sfx/question_correct.mp3").play()

                    setTimeout(() => {
                        setQuestionResponse(undefined)
                        setSelectedAnswer("")
                        setCurrentQuestion(Math.min(questions!.length - 1, currentQuestion + 1))
                    }, 1500)
                }
                else {
                    new Audio("/sfx/question_wrong.mp3").play()
                }
            }
        }
        catch {

        }
    }


    async function getQuestions() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/questions/${topicId}`,
                {
                    credentials: "include"
                }
            )


            if (response.ok) {
                const json = await response.json()
                setQuestions(json["questions"])
                setCurrentQuestion(json["current_question_index"])
            }
            else if (response.status == 409) {
                setState("complete")
            }
        }
        catch {
            
        }
    }


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
                    setBreakData(undefined)

                    return 
                }


                const responseState = json["state"]
                
                if (responseState == "card") {
                    setCurrentCard(json)
                    setBreakData(undefined)
                }
                else if (responseState == "break") {
                    setCurrentCard(undefined)
                    setBreakData(json)
                }
                else if (responseState == "complete") {
                    setCurrentCard(undefined)
                    setBreakData(undefined)
                    setState("questions")
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
        setCardState("hidden")
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
                       <LabeledText
                            text={
                                cardState == "hidden"
                                    ? currentCard!.front
                                    : currentCard!.back
                            }
                        />
                    </div>

                    {cardState == "hidden" ? (
                        <button 
                            className="button transition-all"
                            onClick={() => setCardState("shown")}
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


    function QuestionTask() {
        const question = questions![currentQuestion]

        return (
            <div className="
                w-full h-full absolute flex flex-col items-center justify-center
            ">
                <div className="w-150">
                    {/* Question */}
                    <div className="
                        min-h-40 bg-white border border-black rounded-md flex items-center 
                        justify-center text-center text-xl px-8 py-6 shadow-sm
                    ">
                        <LabeledText text={question.question} />
                    </div>


                    {/* Answers */}
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        {question.options.map((option, index) => {
                            const chose_wrong = option == selectedAnswer && !questionResponse?.correct

                            return (
                                <button
                                    key={index}
                                    onClick={() => submitAnswer(option)}
                                    className={`
                                        group min-h-24 bg-white rounded-lgvpx-5 py-4 rounded-md
                                        flex items-center gap-4 justify-center shadow-sm
                                        hover:bg-gray-200 hover:-translate-y-1 hover:shadow-md
                                        active:translate-y-0 active:scale-[0.98] transition-all
                                        duration-150 cursor-pointer border-black border-1 p-3
                                        ${questionResponse?.answer == option ? (
                                            "!bg-green-300"
                                        ): chose_wrong && (
                                            "!bg-red-300"
                                        )}
                                    `}
                                >
                                    <LabeledText text={option} />
                                </button>
                            )
                        })}
                    </div>


                    {/* User got the question wrong so they should get an explanation on how. */}
                    {questionResponse && selectedAnswer != questionResponse.answer && (
                        <p 
                        className="
                            h-15 flex justify-center items-center bg-gray-200 rounded-md mt-3
                            border-black border-1 p-3 
                        ">
                            <LabeledText text={questionResponse.explanation} />
                        </p>
                    )}
                </div>
            </div>
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


    function TopicComplete() {
        return (
            <>
                <div className="w-full h-screen flex items-center justify-center">
                    <div 
                        className="
                        w-100 h-50 bg-gray-300 rounded-md flex flex-col items-center justify-center
                        border-1 border-black
                    ">
                        <span className="text-[30px] text-gray-700">
                            <b>
                                COMPLETE
                            </b>
                        </span>

                        <Link 
                            href={`/documents/${documentId}/topics`}
                            className="button transition-all mt-5"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </>
        )
    }


    return (
        <div className="relative min-h-screen flex justify-center">
            {currentCard ? (
                <FlashcardTask />
            ) : breakData ? (
                <>
                    <ProgressBar progress={breakData.completion || 0} className="w-150 mt-28" />
                    <RestingPeriod />
                </>
            ) : questions ? (
                <>
                    <ProgressBar progress={Math.round(currentQuestion / 7 * 1000) / 10 || 0} className="w-150 mt-18" />
                    <QuestionTask />
                </>
            ) : state == "complete" && (
                <>
                    <TopicComplete /> 
                </>
            )}
        </div>
    )
}

