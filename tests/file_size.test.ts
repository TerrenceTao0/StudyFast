import { describe, it, expect } from "vitest"
import { formatFileSize } from "@/lib/file_size"

//

describe("file_size.formatFileSize", () => {

    it("Files under 1 MB are shown in KB.", () => {
        expect(formatFileSize(1024)).toBe("1 KB")
        expect(formatFileSize(40 * 1024)).toBe("40 KB")
        expect(formatFileSize(500 * 1024)).toBe("500 KB")
    })


    it("Small files are never shown as 0 MB.", () => {
        expect(formatFileSize(40 * 1024)).not.toBe("0 MB")
    })


    it("Files of 1 MB or more are shown in MB with one decimal.", () => {
        expect(formatFileSize(1024 * 1024)).toBe("1 MB")
        expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB")
        expect(formatFileSize(35 * 1024 * 1024)).toBe("35 MB")
    })


    it("A size that rounds up to 1024 KB is shown as 1 MB.", () => {
        expect(formatFileSize(1024 * 1024 - 1)).toBe("1 MB")
    })

})
