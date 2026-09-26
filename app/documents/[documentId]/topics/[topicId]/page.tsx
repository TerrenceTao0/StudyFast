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


const OPTION_LETTERS = ["A", "B", "C", "D"]

function FlashcardTask({
    card,
    cardState,
    onReveal,
    onReview
}: {
    card: Flashcard
    cardState: string
    onReveal: () => void
    onReview: (answer: string) => void
}) {
    const shown = cardState == "shown"

    return (
        <div className="flex flex-col gap-6 items-center w-full">
            <div className={`
                card w-full min-h-80 flex flex-col items-center justify-center text-center p-8 gap-4
                text-xl transition-all ${shown ? "border-primary/40" : ""}
            `}>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    {shown ? "Answer" : "Question"}
                </span>

                <LabeledText text={shown ? card.back : card.front} />
            </div>

            {!shown ? (
                <button className="btn btn-primary w-48" onClick={onReveal}>
                    Show Answer
                </button>
            ) : (
                <div className="flex gap-3 w-full max-w-sm">
                    <button className="btn btn-danger flex-1" onClick={() => onReview("again")}>
                        Forgot
                    </button>

                    <button className="btn btn-success flex-1" onClick={() => onReview("good")}>
                        Remembered
                    </button>
                </div>
            )}
        </div>
    )
}


function QuestionTask({
    question,
    selectedAnswer,
    questionResponse,
    onAnswer
}: {
    question: QuestionData
    selectedAnswer: string
    questionResponse?: QuestionResponse
    onAnswer: (answer: string) => void
}) {
    return (
        <div className="w-full">
            {/* Question */}
            <div className="card min-h-40 flex items-center justify-center text-center text-xl font-bold px-8 py-6">
                <LabeledText text={question.question} />
            </div>


            {/* Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {question.options.map((option, index) => {
                    const isAnswer = questionResponse?.answer == option
                    const choseWrong = option == selectedAnswer && !questionResponse?.correct

                    return (
                        <button
                            key={index}
                            onClick={() => onAnswer(option)}
                            className={`
                                card min-h-20 px-4 py-3 flex items-center gap-3 text-left cursor-pointer
                                transition-all duration-150 border-2 hover:-translate-y-0.5 hover:border-primary
                                active:translate-y-0 active:scale-[0.98]
                                ${isAnswer ? "!border-success !bg-green-50" : choseWrong ? "!border-danger !bg-red-50" : ""}
                            `}
                        >
                            <span className={`
                                w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-extrabold
                                ${isAnswer ? "bg-success text-white" : choseWrong ? "bg-danger text-white" : "bg-background text-accent"}
                            `}>
                                {OPTION_LETTERS[index]}
                            </span>

                            <LabeledText text={option} />
                        </button>
                    )
                })}
            </div>


            {/* User got the question wrong so they should get an explanation on how. */}
            {questionResponse && selectedAnswer != questionResponse.answer && (
                <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-danger/30 flex flex-col gap-2">
                    <span className="text-sm font-bold text-danger">
                        Not quite
                    </span>

                    <LabeledText text={questionResponse.explanation} />

                    <span className="text-xs text-accent">
                        Click any option to continue.
                    </span>
                </div>
            )}
        </div>
    )
}


function RestingPeriod({
    timeLeft,
    documentId
}: {
    timeLeft: string
    documentId: string
}) {
    return (
        <div className="card w-full min-h-80 flex flex-col gap-2 items-center justify-center text-center p-8">
            <span className="text-2xl font-extrabold">
                Break Time
            </span>

            <span className="text-accent">
                Your next cards will be ready in
            </span>

            <span className="text-5xl font-extrabold text-primary tabular-nums my-2">
                {timeLeft}
            </span>

            <Link href={`/documents/${documentId}/topics`} className="btn btn-ghost mt-3">
                Back to topics
            </Link>
        </div>
    )
}


function TopicComplete({ documentId }: { documentId: string }) {
    return (
        <div className="card w-full min-h-80 flex flex-col gap-3 items-center justify-center text-center p-8">
            <span className="w-16 h-16 rounded-full bg-green-50 text-success text-3xl font-extrabold flex items-center justify-center">
                ✓
            </span>

            <span className="text-3xl font-extrabold">
                Topic Complete
            </span>

            <span className="text-accent">
                Nice work! Head back to continue with the next topic.
            </span>

            <Link href={`/documents/${documentId}/topics`} className="btn btn-primary mt-3">
                Back to topics
            </Link>
        </div>
    )
}

//

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

                    if (json.finished) {
                        setCurrentQuestion(questions!.length)

                        setTimeout(() => {
                            setQuestionResponse(undefined)
                            setSelectedAnswer("")
                            setCurrentQuestion(0)
                            setQuestions(undefined)
                            setState("complete")
                        }, 1500)
                    }
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




    const progress = breakData
        ? breakData.completion || 0
        : questions
            ? Math.round(currentQuestion / 7 * 1000) / 10 || 0
            : undefined

    return (
        <div className="min-h-screen flex flex-col items-center px-4 pt-6 pb-10">
            <div className="w-full max-w-2xl flex items-center gap-4 h-10">
                <Link
                    href={`/documents/${documentId}/topics`}
                    aria-label="Back to topics"
                    className="btn btn-ghost h-9 w-9 px-0 shrink-0"
                >
                    ✕
                </Link>

                {progress !== undefined && (
                    <ProgressBar progress={progress} className="flex-1" />
                )}
            </div>

            <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center py-8">
                {currentCard ? (
                    <FlashcardTask
                        card={currentCard}
                        cardState={cardState}
                        onReveal={() => setCardState("shown")}
                        onReview={review}
                    />
                ) : breakData ? (
                    <RestingPeriod timeLeft={breakTimeLeft} documentId={documentId} />
                ) : questions ? (
                    <QuestionTask
                        question={questions[Math.min(currentQuestion, 6)]}
                        selectedAnswer={selectedAnswer}
                        questionResponse={questionResponse}
                        onAnswer={submitAnswer}
                    />
                ) : state == "complete" && (
                    <TopicComplete documentId={documentId} />
                )}
            </div>
        </div>
    )
}
