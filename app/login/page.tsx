"use client"

import Title from "@/components/title"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { validatePassword, validateEmail } from "@/lib/credential_validation"

//

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [loading, setLoading] = useState(false)

  const errorOccured = emailError != "" || passwordError != ""
  const canSubmit = !errorOccured
   && password.length >= 5 && password.length <= 128 
   && email.length > 0 && email.length <= 320

  async function attemptLogin(event: React.SubmitEvent, email: string, password: string) {
    event.preventDefault()
    setLoading(true)
    
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  email,
                  password
                })
            }
        )
    
    
        const code = response.status 

        if (response.ok) {
          router.push("/home")
        }
        else if (code == 401) {
          setPassword("")
          setPasswordError("Email or password was incorrect.")
        }
        else {
          setPassword("")
          setPasswordError("A server error occured.")
        }

        
    } 
    catch {
      setPassword("")
      setPasswordError("A server error occured.")
    }


    setLoading(false)
  }


  function updateEmail(event: React.ChangeEvent<HTMLInputElement>) {
    const newEmail = event.target.value 
    setEmail(newEmail)
    setEmailError(validateEmail(newEmail))
  }


  function updatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = event.target.value 
    setPassword(newPassword)
    setPasswordError(validatePassword(newPassword))
  }


  return (
    <>
      <div className="flex justify-center items-center w-full h-screen">
        <Title />

        <form 
          className="flex flex-col gap-3 items-center w-70 h-50"
          onSubmit={(event) => attemptLogin(event, email, password)}
        >
            <div className="relative flex flex-col justify-center w-60 text-white">
                <label
                    htmlFor="email"
                    className="
                      transition-all text-black
                      peer-focus:text-primary
                      peer-not-placeholder-shown:text-primary
                    "
                >
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    placeholder=" "
                    value={email}
                    onChange={updateEmail}
                    className={`peer transition-all border-black border-1 rounded-sm outline-none pl-2 text-black ${
                      emailError != "" && "bg-red-50"  
                    }`}
                />

                <p className="text-[12px] text-black min-h-5 mt-2">
                  {emailError}
                </p>
            </div>

            <div className="relative flex flex-col justify-center w-60 text-white">
                <label
                    htmlFor="password"
                    className="
                      transition-all text-black
                      peer-focus:text-primary
                      peer-not-placeholder-shown:text-primary
                    "
                >
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    required
                    placeholder=" "
                    value={password}
                    onChange={updatePassword}
                    className={`peer transition-all border-black border-1 rounded-sm outline-none pl-2 text-black ${
                      passwordError != "" && "bg-red-50"  
                    }`}
                />

                <p className="text-[12px] text-black min-h-5 mt-2">
                  {passwordError}
                </p>
            </div>

            <button 
              type="submit" 
              className={`button transition-all ${!canSubmit && "!opacity-50 !cursor-default"}`}
              disabled={!canSubmit}
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            <button className="squareButton">
              G
            </button>
        </form>
      </div>
    </>
  )
}

