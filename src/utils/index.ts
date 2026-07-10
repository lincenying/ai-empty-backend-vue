import type { CreateTime, LabelValue } from '~/types/global.types'
import type { MenuByAuthorityRoot } from '~/types/menu.types'
import { UTC2Date } from '@lincy/utils'

/**
 * 根据值获取状态
 * @param arr 数组
 * @param val 值
 * @returns 状态
 */
export function getArrState(arr: LabelValue[], val: string | number | boolean): LabelValue {
    let obj = {} as LabelValue
    if (Array.isArray(arr)) {
        obj = arr.find(item => item.value === val || item.label === val) ?? {} as LabelValue
    }
    return obj
}

/**
 * 获取文件名和扩展名
 * @param fullFilename 完整的文件名
 * @returns 文件名和扩展名
 */
export function getFileNameAndExtension(fullFilename: string) {
    // 如果没有点，说明没有扩展名
    if (!fullFilename.includes('.')) {
        return {
            filename: fullFilename,
            extension: '',
        }
    }

    // 分割路径和文件名（处理可能存在的路径）
    const lastSlashIndex = Math.max(
        fullFilename.lastIndexOf('/'),
        fullFilename.lastIndexOf('\\'),
    )
    const filenameWithExt = lastSlashIndex >= 0 ? fullFilename.substring(lastSlashIndex + 1) : fullFilename

    // 找到最后一个点的位置
    const lastDotIndex = filenameWithExt.lastIndexOf('.')

    // 如果点在最前面（如.gitignore），整个字符串作为文件名
    if (lastDotIndex === 0) {
        return {
            filename: filenameWithExt,
            extension: '',
        }
    }

    // 分割文件名和扩展名
    const filename = filenameWithExt.substring(0, lastDotIndex)
    const extension = filenameWithExt.substring(lastDotIndex + 1)

    return {
        filename,
        extension,
    }
}

/**
 * 根据子路径查找父级菜单
 * @param data 菜单数据
 * @param childPath 子路径
 * @returns 父级菜单
 */
export function findParentByChildPath(data: MenuByAuthorityRoot[], childPath: string): MenuByAuthorityRoot | null {
    for (const item of data) {
        // 检查当前项的subMenuList中是否有匹配的id
        if (item.subMenuList && item.subMenuList.some(child => child.path === childPath)) {
            return item
        }

        // 递归检查嵌套的subMenuList
        if (item.subMenuList) {
            for (const child of item.subMenuList) {
                // 如果child有subMenuList属性，则递归查找
                if ('subMenuList' in child) {
                    const result = findParentByChildPath([child], childPath)
                    if (result) {
                        return result
                    }
                }
            }
        }
    }

    return null
}

/**
 * 扁平化菜单数据
 * @param nodes 菜单数据
 * @returns 扁平化后的菜单数据
 */
export function flattenTree(nodes: MenuByAuthorityRoot[]): MenuByAuthorityRoot[] {
    const result: MenuByAuthorityRoot[] = []

    function traverse(node: MenuByAuthorityRoot) {
        // 将当前节点的id和name添加到结果中
        result.push({
            ...JSON.parse(JSON.stringify(node)),
            subMenuList: [],
        })

        // 如果存在子节点，递归遍历它们
        if (node.subMenuList && node.subMenuList.length > 0) {
            node.subMenuList.forEach(child => traverse(child))
        }
    }

    // 遍历所有根节点
    nodes.forEach(node => traverse(node))

    return result
}

/**
 * 提取JSON对象
 * @param input 输入字符串
 * @returns JSON对象数组和剩余字符串
 */
export function extractJsonObjects(input: string): { jsonObjects: any[], remaining: string } {
    const jsonObjects: any[] = []
    let remaining = ''

    // 按行分割输入字符串
    const lines = input.split('\n')

    for (const line of lines) {
        // 跳过空行
        if (!line.trim())
            continue

        let jsonString = line.trim()

        // 检查行是否以"data:"开头
        if (line.startsWith('data:')) {
            // 获取"data:"之后的内容
            jsonString = line.substring(5)
        }

        // 跳过空JSON内容
        if (!jsonString)
            continue

        try {
            // 尝试解析JSON
            const jsonObject = JSON.parse(jsonString)
            jsonObjects.push(jsonObject)
        }
        catch (error) {
            remaining = input
            console.warn('Failed to parse JSON:', jsonString, error)
        }
    }

    return { jsonObjects, remaining }
}

/**
 * 节流函数
 * @param func 函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle(func: AnyFn, limit = 200) {
    let inThrottle: boolean
    return function (...args: any[]) {
        // @ts-expect-error 123
        // eslint-disable-next-line ts/no-this-alias
        const context = this
        if (!inThrottle) {
            func.apply(context, args)
            inThrottle = true
            setTimeout(() => {
                inThrottle = false
            }, limit)
        }
    }
}

/**
 * 数字转换为中文
 * @param num 数字
 * @returns 中文
 */
export function numToChinese(num: number) {
    // 汉字数字
    const cnNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    // 单位
    const cnIntUnits = ['', '十', '百', '千']
    // 整数部分扩展单位
    const cnIntBigUnits = ['', '万', '亿', '兆']

    let cnStr = '' // 中文字符串
    const partLen = 4 // 每部分长度
    const numStr = num.toString() // 数字转换为字符串
    const numLen = numStr.length // 数字长度

    // 根据长度计算部分个数
    const partCount = Math.ceil(numLen / partLen)

    // 遍历每部分
    for (let i = 0; i < partCount; i++) {
        const curPart = numStr.slice(i * partLen, (i + 1) * partLen) // 当前部分
        const curLen = curPart.length // 当前部分长度

        let curCnStr = '' // 当前部分中文字符串

        // 遍历当前部分的每个数字
        for (let j = 0; j < curLen; j++) {
            const curNum = Number.parseInt(curPart.charAt(j)) // 当前数字
            if (curNum !== 0) { // 当前数字不为零时
                curCnStr += cnNums[curNum] + cnIntUnits[curLen - j - 1] // 添加当前数字的大写中文和单位
            }
            else {
                let isAllZero = false // 是否全为零标志

                // 判断当前部分是否全为零
                for (let k = j; k < curLen; k++) {
                    if (Number.parseInt(curPart.charAt(k)) !== 0) {
                        isAllZero = false
                        break
                    }
                    isAllZero = true
                }

                if (!isAllZero) {
                    curCnStr += cnNums[curNum] // 添加零
                }
            }
        }

        curCnStr += cnIntBigUnits[partCount - i - 1] // 添加整数部分扩展单位
        cnStr += curCnStr // 拼接到中文字符串
    }

    return cnStr
}

/**
 * 获取URL参数
 * @param key 参数键
 * @returns 参数值
 */
export function getParamsInUrl(key: string) {
    const url = window.location.href // 获取当前url
    const dz_url = url.includes('?') ? url.substring(url.indexOf('?') + 1) : '' // 获取?之后的字符串
    const cs_url = dz_url ? dz_url.substring(0, dz_url.includes('#/') ? dz_url.lastIndexOf('#/') : dz_url.length) : '' // 获取#/之前的字符串
    const cs_arr = cs_url ? cs_url.split('&') : [] // 参数字符串分割为数组
    const cs: Objable = {}
    for (let i = 0; i < cs_arr.length; i++) {
    // 遍历数组，拿到json对象
        cs[cs_arr[i].substring(0, cs_arr[i].indexOf('='))] = cs_arr[i].substring(cs_arr[i].indexOf('=') + 1)
    }
    const v = cs[key]
    return v ? v.replace(/^\/*|\/*$/g, '') : v // 去掉头尾'/'
}

/**
 * 获取assets静态资源
 * @param url 资源路径
 * @returns 资源URL
 */
export function getImgUrl(url: string) {
    return new URL(`../assets/images/${url}`, import.meta.url).href
}

/**
 * 格式化字节
 * @param bytes 字节
 * @param isLowerCase 是否小写
 * @returns 格式化后的字节
 */
export function formatBytes(bytes: any, isLowerCase = false) {
    if (typeof bytes === 'number') {
        const KB = 1024
        const MB = KB * 1024
        const KBUnit = 'KB'
        const MBUnit = 'MB'
        const BUnit = 'B'
        if (bytes >= MB) {
            return (bytes / MB).toFixed(2) + (isLowerCase ? MBUnit.toLocaleLowerCase() : MBUnit)
        }
        else if (bytes >= KB) {
            return (bytes / KB).toFixed(2) + (isLowerCase ? KBUnit.toLocaleLowerCase() : KBUnit)
        }
        else {
            return bytes + (isLowerCase ? BUnit.toLocaleLowerCase() : BUnit)
        }
    }
    return '-'
}

/**
 * 计算文本宽度
 * @param text 文本
 * @param fontSize 字体大小
 * @returns 文本宽度
 */
export function calcTextEm(text = '', fontSize = 1) {
    // 创建临时元素
    const _span = document.createElement('span')
    // span元素转块级
    _span.style.visibility = 'hidden'
    _span.style.position = 'absolute'
    _span.style.left = '-999px'
    // 放入文本
    _span.textContent = text
    // 设置文字大小
    _span.style.fontSize = `${fontSize}px`
    // span放入body中
    document.body.appendChild(_span)
    // 获取span的宽度
    const width = _span?.offsetWidth ?? 0
    const len = width / fontSize
    // 从body中删除该span
    document.body.removeChild(_span)
    // 返回span宽度
    return len
}

/**
 * 格式化时间
 * @param time 时间
 * @returns 格式化后的时间
 */
export function formatTime(time?: string | number | CreateTime) {
    if (!time)
        return '-'
    if (typeof time === 'string' || typeof time === 'number')
        return UTC2Date(time, 'yyyy-mm-dd hh:ii:ss')
    return UTC2Date(time?.time, 'yyyy-mm-dd hh:ii:ss')
}

/**
 * 检查是否需要登录
 * @returns 是否需要登录
 */
export function checkNeedLogin() {
    return window.location.hash.match(/\/login|\/h5/g)
}

/**
 * 复制指定字符串到粘贴板
 * @param text 需要复制的字符串
 * @returns 返回一个Promise，成功时为true，失败时为false
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        // 方法1: 使用现代 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
            return true
        }

        // 方法2: 降级方案 - 使用 textarea 和 execCommand
        const textArea = document.createElement('textarea')
        textArea.value = text

        // 隐藏 textarea，不在可视区域显示
        textArea.style.position = 'fixed'
        textArea.style.top = '0'
        textArea.style.left = '0'
        textArea.style.opacity = '0'

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        return successful
    }
    catch (err) {
        console.error('复制到粘贴板失败:', err)
        return false
    }
}

/**
 * 查找具有指定类名的下一个兄弟元素节点
 * @param element - 起始元素，从该元素开始向后查找
 * @param className - 要查找的CSS类名
 * @returns 找到的第一个具有指定类名的兄弟元素，如果未找到则返回null
 */
export function findNextSiblingWithClass(element: Element, className: string) {
    let sibling = element.nextElementSibling
    while (sibling) {
        if (sibling.classList.contains(className)) {
            return sibling
        }
        sibling = sibling.nextElementSibling
    }
    return null // 如果没有找到，返回null
}
