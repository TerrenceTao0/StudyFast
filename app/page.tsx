"use client"

import Link from "next/link"
import Title from "@/components/title"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { NEXT_REWRITTEN_PATH_HEADER } from "next/dist/client/components/app-router-headers"

//

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const errorOccured = emailError != "" || passwordError != ""
  const canSubmit = !errorOccured
   && password.length >= 5 && password.length <= 128 
   && email.length > 0 && email.length <= 320

  async function createAccount(event: React.SubmitEvent, email: string, password: string) {
    event.preventDefault()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    )


    const data = await response.json()
    const status = response.status 

    if (status == 201) {
      // Account made succesfully, prompt user to login now.
      router.push("/login")
    }
    else if (status == 409) {
      setEmail("")
      setEmailError("Email is already being used.")
    }
    else {
      setEmail("")
      setPassword("")
      setPasswordError("A server error occured.")
    }


    return data
  }


  function updateEmail(event: React.ChangeEvent<HTMLInputElement>) {
    const newEmail = event.target.value 
    setEmail(newEmail)

    if (newEmail.length > 320) {
      setEmailError("Email length cannot exceed 320 characters.")
    }
    else if (!newEmail.includes("@") && newEmail.length > 0) {
      setEmailError("Enter a valid email.")
    }
    else {
      setEmailError("")
    }
  }


  function updatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = event.target.value 
    setPassword(newPassword)

    if (newPassword.length > 128) {
      setPasswordError("Password cannot be longer than 128 characters.")
    } 
    else if (newPassword.length >= 5) {
      setPasswordError("")
    }
    else if (newPassword.length > 0) {
      setPasswordError("Password must be at least 5 characters long.")
    }
    else {
      setPasswordError("")
    }
  }


  return (
    <>
      <div className="flex justify-center items-center w-full h-screen">
        <Title />

        <form 
          className="flex flex-col gap-3 items-center w-70 h-50"
          onSubmit={(event) => createAccount(event, email, password)}
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
                Create Account
            </button>

            <div className="flex w-50 items-center gap-3">
              <div className="flex-1 border-t border-foreground" />

              <span className="text-sm">
                OR
              </span>

              <div className="flex-1 border-t border-foreground" />
            </div>

            <Link href="login" className="button transition-all">
              Login
            </Link>

            <button className="squareButton">
              G
            </button>
        </form>
      </div>
    </>
  )
}

