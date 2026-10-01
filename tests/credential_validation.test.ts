import { describe, it, expect } from "vitest"
import { validateEmail, validatePassword } from "@/lib/credential_validation"

//

describe("credential_validation.validateEmail", () => {

    it("Email length should not exceed 320 characters.", () => {
        const testStr = "w".repeat(320) + "gmail.com" 
        const response = validateEmail(testStr)
        expect(response).toBe("Email length cannot exceed 320 characters.")
    })


    it("Input needs to be a valid email.", () => {
        const input = "Not@AnEmail@"
        const response = validateEmail(input)
        expect(response).toBe("Enter a valid email.")
    })


    it("Valid email of valid length should pass.", () => {
        const input = "dave32@gmail.com"
        const response = validateEmail(input)
        expect(response).toBe("")
    })
})



describe('credential_validation.validatePassword', () => {

    it("Password length should not exceed 128 characters.", () => {
        const input = "1".repeat(129)
        const response = validatePassword(input)
        expect(response).toBe("Password cannot be longer than 128 characters.")
    })


    it("Password must be at least 5 characters long.", () => {
        const input = "111"
        const response = validatePassword(input)
        expect(response).toBe("Password must be at least 5 characters long.")
    })


    it("Valid password should pass", () => {
        const input = "327948m5h6b3456nmh8"
        const response = validatePassword(input)
        expect(response).toBe("")
    })

})
