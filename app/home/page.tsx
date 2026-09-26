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

type UploadProps = {
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const ACCEPTED_FILES = ".pdf,.docx,.txt"

//

function EmptyUpload({ onUpload }: UploadProps) {
    return (
        <div className="w-full min-h-screen flex justify-center items-center p-6 pt-24">
            <label
                htmlFor="file-upload"
                className="
                    card w-full max-w-2xl h-96 flex flex-col gap-3 justify-center items-center cursor-pointer
                    border-2 border-dashed transition-all hover:border-primary hover:bg-primary-soft group
                "
            >
                <input
                    id="file-upload"
                    type="file"
                    accept={ACCEPTED_FILES}
                    className="hidden"
                    onChange={onUpload}
                />

                <span className="
                    w-14 h-14 rounded-2xl bg-primary-soft text-primary text-3xl font-bold
                    flex items-center justify-center transition-all group-hover:scale-110
                ">
                    +
                </span>

                <p className="text-lg font-bold">
                    Upload your first document
                </p>

                <p className="text-accent text-sm">
                    PDF, DOCX, or TXT
                </p>
            </label>
        </div>
    )
}


function AddDocument({ onUpload }: UploadProps) {
    return (
        <label className="
            h-40 rounded-2xl border-2 border-dashed border-border bg-surface/60 text-accent
            flex flex-col gap-1 justify-center items-center cursor-pointer transition-all
            hover:border-primary hover:text-primary hover:bg-primary-soft
        ">
            <span className="text-3xl font-bold">+</span>
            <span className="text-sm font-bold">Add document</span>

            <input
                type="file"
                accept={ACCEPTED_FILES}
                className="hidden"
                onChange={onUpload}
            />
        </label>
    )
}


function Document({
    document,
    onOpen,
    onDelete
}: {
    document: DocumentData
    onOpen: () => void
    onDelete: () => void
}) {
    const ready = document.status === "ready"

    return (
        <div className="relative group">
            <button
                onClick={onOpen}
                disabled={!ready}
                className="
                    card w-full h-40 p-4 flex flex-col justify-between text-left transition-all
                    enabled:cursor-pointer enabled:hover:-translate-y-1 enabled:hover:shadow-lg
                    enabled:hover:border-primary disabled:cursor-wait
                "
            >
                {ready ? (
                    <span className="font-bold leading-snug line-clamp-3 pr-6">
                        {document.title}
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-accent text-sm font-bold">
                        <span className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                        Processing...
                    </span>
                )}

                <div className="flex flex-col gap-2 w-full">
                    {ready && <ProgressBar progress={document.mastery} />}

                    <span className="text-xs text-accent">
                        {Math.round(
                            document.size_bytes / 1024 / 1024 * 10
                        ) / 10} MB
                    </span>
                </div>
            </button>

            <button
                onClick={onDelete}
                aria-label="Delete document"
                className="
                    absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center
                    text-accent cursor-pointer transition-all opacity-60 group-hover:opacity-100
                    hover:bg-red-50 hover:text-danger
                "
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
            </button>
        </div>
    )
}

//

export default function Home() {
    const router = useRouter()
    const [documents, setDocuments] = useState<DocumentData[]>()
    const [documentToDelete, setDocumentToDelete] = useState<number>()

    useEffect(() => {
        getDocuments()
    }, [])

    // Poll user's documents so they can see the status of their documents live.
    useEffect(() => {
        const processing = documents?.some(
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
                    prev?.filter(document => document.id !== documentId)
                )
            }
        }
        catch {

        }
    }


    async function getDocuments() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/documents`,
                {
                    "credentials": "include"
                }
            )


            if (!response.ok) {
                setDocuments([])
                return
            }


            const data = await response.json()
            setDocuments(data)
        }
        catch {
            setDocuments([])
        }
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


    return (
        <>
            <NavBar />

            {!documents ? (
                <div className="w-full min-h-screen flex items-center justify-center">
                    <span className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
                </div>
            ) : documents.length == 0 ? (
                <EmptyUpload onUpload={uploadFile} />
            ) : (
                <div className="w-full max-w-5xl mx-auto px-4 pt-28 pb-10">
                    <h1 className="text-3xl font-extrabold mb-6">
                        Your documents
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <AddDocument onUpload={uploadFile} />

                        {documents.map((document) => (
                            <Document
                                key={document.id}
                                document={document}
                                onOpen={() => router.push(`/documents/${document.id}/topics`)}
                                onDelete={() => setDocumentToDelete(document.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {documentToDelete && (
                <ConfirmationPrompt
                    message="Delete this document?"
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
