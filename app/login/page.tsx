import Title from "@/components/title"

//

export default function Login() {
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
                            className="peer bg-background border-white border-1 rounded-sm outline-none pl-2"
                        />

                        <label
                            htmlFor="email"
                            className="
                                absolute left-5 bottom-6 text-white transition-all
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
                            className="peer g-background border-white border-1 rounded-sm outline-none pl-2"
                        />

                        <label
                            htmlFor="password"
                            className="
                                absolute left-5 bottom-6 text-white transition-all
                                peer-focus:text-primary
                                peer-not-placeholder-shown:text-primary
                            "
                        >
                            Password
                        </label>
                    </div>

                    <button type="submit" className="bg-foreground button transition-all">
                        Login
                    </button>
                </form>
            </div>
        </>
    )
}

