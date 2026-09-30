export async function getDocument(documentId: string) {
    const response = await fetch(
        `/api/documents/${documentId}`,
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

