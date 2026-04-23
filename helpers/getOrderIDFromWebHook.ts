export const getOrderIDFromWebHook = (code : string ) : string => {
    const match = code.match(/\d+$/)
    return match ? match[0] : ""
}
