"use client"

import Link from "next/link"
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
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-16 w-full min-h-screen p-6">
        <Title />

        <form
          className="card flex flex-col gap-3 w-full max-w-sm p-7"
          onSubmit={(event) => attemptLogin(event, email, password)}
        >
            <h2 className="text-2xl font-extrabold mb-1">
              Welcome back
            </h2>

            <div className="flex flex-col gap-1.5 group">
                <label htmlFor="email" className="text-sm font-bold text-accent group-focus-within:text-primary transition-colors">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={updateEmail}
                    className={`input ${emailError != "" ? "input-error" : ""}`}
                />

                <p className="text-xs text-danger min-h-4">
                  {emailError}
                </p>
            </div>

            <div className="flex flex-col gap-1.5 group">
                <label htmlFor="password" className="text-sm font-bold text-accent group-focus-within:text-primary transition-colors">
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={updatePassword}
                    className={`input ${passwordError != "" ? "input-error" : ""}`}
                />

                <p className="text-xs text-danger min-h-4">
                  {passwordError}
                </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!canSubmit || loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            <div className="flex items-center gap-3 my-1 text-accent">
              <div className="flex-1 border-t border-border" />

              <span className="text-xs font-bold">
                OR
              </span>

              <div className="flex-1 border-t border-border" />
            </div>

            <button type="button" className="btn btn-ghost w-full">
              Continue with Google
            </button>

            <p className="text-sm text-center text-accent mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/" className="font-bold text-primary hover:underline">
                Sign up
              </Link>
            </p>
        </form>
      </div>
    </>
  )
}
