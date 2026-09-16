"use client"

import { useEffect, useState } from "react"
import NavBar from "@/components/navbar"

//

export default function Flashcards() {
    const cards = [
        {"question": "question 1", "answer": "answer 1"},
        {"question": "question 2", "answer": "answer 2"},
        {"question": "question 3", "answer": "answer 3"},
        {"question": "question 4", "answer": "answer 4"},
        {"question": "question 5", "answer": "answer 5"}
    ]

    const [remembered, setRemembered] = useState([])
    const [mastered, setMastered] = useState([])
    const [state, setState] = useState("question")
    const [currentCard, setCurrentCard] = useState(cards[0])
    const [grace, setGrace] = useState(true)

    function giveResponse(response: string) {
        if (response == "correct") {
            if (mastered.length + 1 >= cards.length) { 
                setState("complete")
            }
            else {
                setState("question")
            }
        }
        else {
            setState("question")
        }
    }


    function Flashcard() {
        const progress = Math.round(mastered.length / cards.length * 100)

        return (
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <div className="w-150 h-5 bg-foreground border-[1.5px] relative">
                    <p className="w-full h-full absolute flex justify-center items-center text-white">
                        <b>
                            {progress}%
                        </b>
                    </p>

                    <div className={`w-[${progress}%] h-full bg-primary`}></div>
                </div>

                <div className="w-150 h-70 bg-white border-gray-500 border-2 mt-2">
                    <p className="p-5 text-[20px] w-full h-full flex items-center justify-center">
                        {
                            state === "question" ? currentCard.question 
                            : 
                            state === "answer" ? currentCard.answer 
                            :
                            "Complete" 
                        }
                    </p>
                </div>

                <div className="mt-10">
                    {
                        // Only let user see answer after "grace" period ends to guard against spam.
                        // On answer state ask user for feedback on question.
                        // Once user has "mastered" all cards, let them return or try again.
                        state === "question" ? (
                            !grace && (
                                <button 
                                    className="button"
                                    onClick={() => setState("answer")}
                                >
                                    Show Answer
                                </button>
                            )
                        ) : state == "answer" ? (
                            <div className="flex gap-5">
                                <button 
                                    className="button !bg-red-400"
                                    onClick={() => giveResponse("forgot")}
                                >
                                    Forgot
                                </button>

                                <button 
                                    className="button !bg-green-400"
                                    onClick={() => giveResponse("correct")}
                                >
                                    Remembered
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-5">
                                <button 
                                    className="button"
                                >
                                    Return
                                </button>

                                <button 
                                    className="button"
                                >
                                    Again
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }


    return (
        <>
            <NavBar />
            <Flashcard />
        </>
    )
}

