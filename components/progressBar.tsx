export function ProgressBar(progress: number) {
    return (
        <>
            <div className="w-150 h-5 bg-foreground border-[1.5px] relative">
                <p className="w-full h-full absolute flex justify-center items-center text-white">
                    <b>
                        {progress}%
                    </b>
                </p>

                <div className={`w-[${progress}%] h-full bg-primary`}></div>
            </div> 
        </>
    )
}