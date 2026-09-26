export default function Title() {
    return (
        <div className="flex flex-col gap-4 max-w-sm text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                Study<span className="text-primary">Fast</span>
            </h1>

            <p className="text-lg text-accent">
                Submit your material and let AI generate practice questions, flashcards, and mock tests that get graded.
            </p>

            <p className="text-lg text-accent">
                Track progress, manage courses, and dominate your class.
            </p>
        </div>
    )
}
