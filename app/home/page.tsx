"use client"

import NavBar from "@/components/navbar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ProgressBar from "@/components/progressBar"
import ConfirmationPrompt from "@/components/confirmationPrompt"
 
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
    const [documentToDelete, setDocumentToDelete] = useState<number>()

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


    async function deleteDocument(documentId: number) {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            )


            if (response.ok) {
                setDocuments(prev =>
                    prev.filter(document => document.id !== documentId)
                )
            }
        }
        catch {

        }
    }

    
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
            <div className="flex flex-col gap-0.5">
                {document.status != "ready" ? (
                    <div className="h-4" />
                ) : (
                    <ProgressBar progress={document.mastery} />
                )}

                <div className="relative w-50 h-30">
                    <button
                        onClick={() => {
                            if (document.status === "ready") {
                                router.push(
                                    `/documents/${document.id}/topics`
                                )
                            }
                        }}
                        className="
                            transition-all hover:bg-primary hover:text-white
                            w-full h-full rounded-sm bg-gray-200
                            border-black border flex justify-center items-center
                            cursor-pointer
                        "
                    >
                        {document.status !== "ready" ? (
                            <div
                                className="
                                    w-10 h-10 border-3 border-gray-400 border-t-primary
                                    rounded-full animate-spin
                                "
                            />
                        ) : (
                            <span className="px-3 pr-9 text-left text-[14px]">
                                {document.title}
                            </span>
                        )}

                        <p className="absolute right-2 bottom-1 text-gray-400 text-sm">
                            {Math.round(
                                document.size_bytes / 1024 / 1024 * 10
                            ) / 10} MB
                        </p>
                    </button>

                    <button
                        onClick={() => setDocumentToDelete(document.id)}
                        className="
                            absolute top-1 right-1 w-7 h-7 rounded text-red-600 cursor-pointer
                            hover:bg-red-300 hover:border-1 hover:border-black transition-all
                        "
                    >
                        x
                    </button>
                </div>
            </div>
        )
    }


    function GridLayout() {
        return (
            <>
                <div className="w-full min-h-screen flex pt-20 pb-5 justify-center items-start">
                    <div className="
                        w-220 grid grid-cols-4 
                        gap-5 p-2 content-start min-h-120
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

                {documentToDelete && (
                    <ConfirmationPrompt 
                        message="Delete this course?"
                        onNo={() => setDocumentToDelete(undefined)}
                        onYes={() => {
                            deleteDocument(documentToDelete)
                            setDocumentToDelete(undefined)
                        }}
                    />
                )}
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

