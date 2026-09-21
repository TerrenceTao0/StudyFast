"use client"

import NavBar from "@/components/navbar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProgressBar } from "@/components/progressBar"
 
//

type DocumentData = {
    id: number,
    title: string, 
    size_bytes: number,
    status: string,
    mastery: number
}

//

export default function Home() { 
    const router = useRouter()
    const [documents, setDocuments] = useState<DocumentData[]>([])

    useEffect(() => {
        getDocuments()
    }, [])

    // Poll user's documents so they can see the status of their documents live.
    useEffect(() => {
        const processing = documents.some(
            (document) => 
                document.status == "pending" ||
                document.status == "processing"
        )


        if (!processing) {
            return 
        }


        const timeout = setTimeout(() => {
            getDocuments()
        }, 2000)


        return () => clearTimeout(timeout)

    }, [documents])

    
    async function getDocuments() {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/documents`,
            {
                "credentials": "include"
            }
        ) 


        if (!response.ok) {
            return 
        }


        const data = await response.json()
        setDocuments(data)
    }

 
    async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null 

        if (!file) {
            return 
        }


        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
            {
                "method": "POST",
                "credentials": "include",
                "body": formData 
            }
        )


        if (!response.ok) {
            return
        }
        

        getDocuments()
    }


    function EmptyUpload() {
        return (
            <>
                <div className="w-full h-screen flex justify-center items-center">
                   <label
                        htmlFor="file-upload"
                        className="
                            transition-all hover:bg-gray-300 w-170 h-100 rounded-sm
                            flex flex-col bg-gray-200 border-black border-1 justify-center
                            items-center relative cursor-pointer
                        "
                    >
                        <input
                            id="file-upload"
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={uploadFile}
                        />

                        <p className="text-[30px] text-gray-700">
                            +
                        </p>

                        <p className="text-gray-500">
                            Upload a PDF, DOCX, or TXT to get started.
                        </p>
                    </label>
                </div>
            </>
        )
    }


    function AddDocument() {
        return (
            <label className="
                transition-all hover:bg-primary hover:text-white w-50 h-34.5 rounded-sm 
                bg-gray-200 border-black border-1 flex justify-center items-center 
                cursor-pointer text-[30px] text-gray-500
            ">
                +

                <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={uploadFile}
                />
            </label>
        )
    }


    function Document({
        document
    }: {
        document: DocumentData
    }) {
        return (
            <>
                <div className="flex flex-col gap-0.5">
                    {/* Mastery progress bar may be mistaken for a loading bar so hide it until document is ready. */}
                    {document.status != "ready" ? (
                        <div className="h-4">

                        </div>
                    ): (
                        <ProgressBar progress={document.mastery}/>
                    )}


                    <button 
                        onClick={() => {
                            if (document.status === "ready") {
                                router.push(`/documents/${document.id}/topics`)
                            }
                        }}
                        className="
                            transition-all hover:bg-primary hover:text-white w-50 h-30 rounded-sm 
                            bg-gray-200 border-black border-1 flex justify-center items-center 
                            cursor-pointer relative
                        "
                    >
                        {document.title}

                        <p className="absolute right-2 bottom-1 text-gray-400 text-sm">
                            {Math.round(document.size_bytes / 1024 / 1024 * 10) / 10} MB
                        </p>
                    </button>
                </div>
            </>
        )
    }


    function GridLayout() {
        return (
            <>
                <div className="w-full min-h-screen flex pt-20 pb-5 justify-center items-start">
                    <div className="
                        w-220 border-black grid grid-cols-4 
                        gap-5 border-1 p-2 content-start min-h-120
                    ">
                        <AddDocument />

                        {documents.map((document) => (
                            <Document 
                                key={document.id}
                                document={document}
                            />
                        ))}
                    </div>
                </div>
            </>
        )
    }


    return (
        <>
            <NavBar />

            {documents.length == 0 ? <EmptyUpload /> : <GridLayout />}
        </>
    )
}

