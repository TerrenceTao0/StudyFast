"use client"

import Link from "next/link"
import Title from "@/components/title"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { validatePassword, validateEmail } from "@/lib/credential_validation"

//

export default function LandingPage() {
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

  async function createAccount(event: React.SubmitEvent, email: string, password: string) {
    event.preventDefault()
    setLoading(true)

    try {
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

      const status = response.status 

      if (response.ok) {
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
    } 
    catch {
      setEmail("")
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
          className="flex flex-col gap-2 items-center w-60 h-90 mt-30"
          onSubmit={(event) => createAccount(event, email, password)}
        >
            <div className="relative flex flex-col justify-center w-full">
                <label
                    htmlFor="email"
                    className="
                      transition-all
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
                    className={`peer transition-all border-black border-1 rounded-sm outline-none pl-2 ${
                      emailError != "" && "bg-red-50"  
                    }`}
                />

                <p className="text-[12px] min-h-5 mt-2">
                  {emailError}
                </p>
            </div>

            <div className="relative flex flex-col justify-center w-full">
                <label
                    htmlFor="password"
                    className="
                      transition-all
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
                    className={`peer transition-all border-black border-1 rounded-sm outline-none pl-2 ${
                      passwordError != "" && "bg-red-50"  
                    }`}
                />

                <p className="text-[12px] min-h-5 mt-2">
                  {passwordError}
                </p>
            </div>

            <button 
              type="submit" 
              className={`button transition-all ${!canSubmit && "!opacity-50 !cursor-default"}`}
              disabled={!canSubmit}
            >
                {loading ? "Creating..." : "Create Account"}
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

            <button className="cursor-pointer w-10 h-10 bg-foreground text-white rounded-sm">
              G
            </button>
        </form>
      </div>
    </>
  )
}

