import NavBar from "@/components/navbar"
import Link from "next/link"

//

export function AddOrg() {
    return (
        <button className="cursor-pointer border-1 border-white w-45 h-20 hover:bg-white hover:text-black rounded-md">
            +
        </button>
    )
}


export function SelectOrg(x: string) {
    return (
        <Link 
            key={x}
            href="/organization"
            className="flex justify-center items-center border-1 border-white w-45 h-20 hover:bg-white hover:text-black rounded-md"
        >
            {x}
        </Link>
    )
}

//

export default function Admin() {
    var orgs = [
        "Org 1",
        "Org 2",
        "Org 3",
        "Org 4"
    ]

    return (
        <>
            <NavBar />

            <div className="w-full h-screen flex justify-center items-center">
                <div className="left-5 w-50 h-100 absolute">
                    
                </div>

                <div className="border-1 border-white rounded-[15px] w-200 h-100 gap-5 grid p-5">
                    {orgs.map(SelectOrg)}                   
                    {orgs.length < 5 && <AddOrg />}
                </div>
            </div>
        </>
    )
}

