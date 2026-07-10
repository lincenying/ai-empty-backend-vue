import CryptoJS from 'crypto-js'

/**
 * 加密
 * @param text 文本
 * @param key 密钥
 * @returns 加密后的文本
 */
export function encryptAES(text: unknown, key: string) {
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(text), key).toString()
    const encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
    return encData
}

/**
 * 解密
 * @param encryptedText 加密后的文本
 * @param key 密钥
 * @returns 解密后的文本
 */
export function decryptAES(encryptedText: string, key: string) {
    let decData
    try {
        decData = CryptoJS.enc.Base64.parse(encryptedText).toString(CryptoJS.enc.Utf8)
    }
    catch (_e) {
        decData = encryptedText
    }
    const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8)
    try {
        return JSON.parse(bytes)
    }
    catch (_e) {
        return bytes
    }
}
