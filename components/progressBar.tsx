export function ProgressBar({
    progress,
    className
}: {
    progress: number
    className?: string
}) {
    return (
        <div
            className={`
                h-4
                bg-gray-200
                rounded-sm
                overflow-hidden
                relative
                border border-gray-300
                ${className ?? ""}
            `}
        >
            <div
                className="
                    h-full
                    bg-primary
                    rounded-sm
                    transition-all
                "
                style={{
                    width: `${progress}%`
                }}
            />

            <p
                className="
                    absolute inset-0 border-gray-500 border-1
                    flex items-center justify-center 
                    text-xs font-semibold
                "
            >
                {progress}%
            </p>
        </div>
    )
}

