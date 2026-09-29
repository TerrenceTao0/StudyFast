export default function ProgressBar({
    progress,
    className
}: {
    progress: number
    className?: string
}) {
    return (
        <div className={`relative h-5 bg-border rounded-full overflow-hidden ${className ?? ""}`}>
            <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                    width: `${progress}%`
                }}
            />

            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-foreground tabular-nums">
                {progress}%
            </span>
        </div>
    )
}
