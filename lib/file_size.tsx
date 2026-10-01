export function formatFileSize(bytes: number) {
    const kilobytes = Math.round(bytes / 1024)

    // Small files would round down to "0 MB", so they are shown in KB.
    // Don't bother rounding to 1 dp as file size is so small.
    if (kilobytes < 1024) {
        return `${kilobytes} KB`
    }


    return `${Math.round(bytes / 1024 / 1024 * 10) / 10} MB`
}
