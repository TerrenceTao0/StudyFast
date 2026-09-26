export default function ProgressBar({
    progress,
    className
}: {
    progress: number
    className?: string
}) {
    return (
        <div className={`flex items-center gap-2 ${className ?? ""}`}>
            <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                        width: `${progress}%`
                    }}
                />
            </div>

            <span className="text-xs font-bold text-accent tabular-nums min-w-9 text-right">
                {progress}%
            </span>
        </div>
    )
}
