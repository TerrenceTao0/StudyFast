export async function getDocument(documentId: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
        {
            "credentials": "include"
        }
    ) 


    if (!response.ok) {
        return 
    }


    const data = await response.json()
    
    return data
}

