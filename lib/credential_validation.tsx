export function validatePassword(password: string) {
    if (password.length > 128) {
        return "Password cannot be longer than 128 characters."
    } 
    else if (password.length >= 5) {
        return ""
    }
    else if (password.length > 0) {
        return "Password must be at least 5 characters long."
    }
    else {
        return ""
    }
}


export function validateEmail(email: string) {
    if (email.length > 320) {
        return "Email length cannot exceed 320 characters."
    }
    else if (!email.includes("@") && email.length > 0) {
        return "Enter a valid email."
    }
    else {
        return ""
    }
}

