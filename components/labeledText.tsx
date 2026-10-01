export default function LabeledText({ text }: { text: string }) {
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
