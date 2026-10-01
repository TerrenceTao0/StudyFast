import LabeledText from "@/components/labeledText"

//

const OPTION_LETTERS = ["A", "B", "C", "D"]

export type QuestionData = {
    id: number,
    question: string,
    options: string[],
    difficulty: string
}

export type QuestionResponse = {
    correct: boolean,
    answer: string,
    mastery: number,
    finished?: boolean
}

//

export default function QuestionTask({
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
                                ${isAnswer ? "border-success! bg-green-50!" : choseWrong ? "border-danger! bg-red-50!" : ""}
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
        </div>
    )
}
