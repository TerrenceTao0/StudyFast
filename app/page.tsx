import Link from "next/link"
import Title from "@/components/title"

//

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center w-full h-screen">
        <Title />

        <form className="flex flex-col gap-5 items-center w-70 h-50">
            <div className="relative mt-7 flex justify-center w-60 h-8 text-white">
                <input
                    id="email"
                    type="email"
                    required
                    placeholder=" "
                    className="peer border-black border-1 rounded-sm outline-none pl-2 text-black"
                />

                <label
                    htmlFor="email"
                    className="
                      absolute left-5 bottom-6 transition-all text-black
                      peer-focus:text-primary
                      peer-not-placeholder-shown:text-primary
                    "
                >
                    Email
                </label>
            </div>

            <div className="relative mt-7 flex justify-center w-60 h-8 text-white">
                <input
                    id="password"
                    type="password"
                    required
                    placeholder=" "
                    className="peer border-black border-1 rounded-sm outline-none pl-2 text-black"
                />

                <label
                    htmlFor="password"
                    className="
                      absolute left-5 bottom-6 transition-all text-black
                      peer-focus:text-primary
                      peer-not-placeholder-shown:text-primary
                    "
                >
                    Password
                </label>
            </div>

            <button type="submit" className="bg-foreground button transition-all">
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

