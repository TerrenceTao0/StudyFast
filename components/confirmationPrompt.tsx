type Props = {
    message: string
    onYes: () => void
    onNo: () => void
}

//

export default function ConfirmationPrompt({
    message,
    onYes,
    onNo
}: Props) {
    return (
        <div className="
            fixed inset-0 flex items-center justify-center bg-black/30 z-50
        ">
            <div className="
                bg-white border border-black rounded-md p-6 w-80 flex flex-col gap-5
            ">
                <p className="text-center">
                    {message}
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onYes}
                        className="button transition-all !bg-green-400"
                    >
                        Yes
                    </button>

                    <button
                        onClick={onNo}
                        className="button transition-all"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    )
}

