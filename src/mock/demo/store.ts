import type {
    IDemoCreateBody,
    IDemoListItem,
    IDemoListParams,
    IDemoListResult,
    IDemoUpdateBody,
    IDemoUpdateStatusBody,
} from '~/types/demo.types'
import { DEMO_DESCRIPTION_MAX_LEN, DEMO_TITLE_MAX_LEN } from '~/pages/demo/config'
import { createDemoSeed } from './seed'

const STATUS_SUCCESS = '000000'

let records: IDemoListItem[] = createDemoSeed()
let nextId = records.length + 1

interface IMockResponse<T = unknown> {
    statusCode: string
    message: string
    result?: T
}

/**
 * 模拟网络延迟
 */
function mockDelay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 构造成功响应
 */
function success<T>(result: T, message = 'success'): IMockResponse<T> {
    return { statusCode: STATUS_SUCCESS, message, result }
}

/**
 * 构造失败响应
 */
function fail<T = undefined>(message: string): IMockResponse<T> {
    return { statusCode: '999999', message }
}

/**
 * 格式化当前时间
 */
function formatNow(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * 按条件过滤列表
 */
function filterRecords(params: IDemoListParams): IDemoListItem[] {
    const keyword = params.title?.trim().toLowerCase()
    return records.filter((item) => {
        if (params.status !== undefined && params.status !== '' && String(item.status) !== params.status)
            return false
        if (!keyword)
            return true
        return item.title.toLowerCase().includes(keyword)
            || item.description.toLowerCase().includes(keyword)
    })
}

/**
 * 分页查询示例列表
 */
export async function mockDemoPage(params: IDemoListParams): Promise<IMockResponse<IDemoListResult>> {
    await mockDelay()
    const filtered = filterRecords(params)
    const currPage = Math.max(1, Number(params.currPage ?? 1))
    const pageSize = Math.max(1, Number(params.pageSize ?? 20))
    const start = (currPage - 1) * pageSize
    const pageRecords = filtered.slice(start, start + pageSize)
    return success({
        records: pageRecords,
        total: filtered.length,
    })
}

/**
 * 查询示例详情
 */
export async function mockDemoDetail(id: string): Promise<IMockResponse<IDemoListItem>> {
    await mockDelay()
    const item = records.find(record => record.id === id)
    if (!item)
        return fail('数据不存在')
    return success({ ...item })
}

/**
 * 校验表单字段
 */
function validateBody(body: IDemoCreateBody): string | null {
    const title = body.title?.trim() ?? ''
    const description = body.description?.trim() ?? ''
    if (!title)
        return '请输入标题'
    if (title.length > DEMO_TITLE_MAX_LEN)
        return `标题不能超过 ${DEMO_TITLE_MAX_LEN} 个字符`
    if (description.length > DEMO_DESCRIPTION_MAX_LEN)
        return `描述不能超过 ${DEMO_DESCRIPTION_MAX_LEN} 个字符`
    return null
}

/**
 * 创建示例数据
 */
export async function mockDemoCreate(body: IDemoCreateBody): Promise<IMockResponse<IDemoListItem>> {
    await mockDelay()
    const error = validateBody(body)
    if (error)
        return fail(error)
    const now = formatNow()
    const item: IDemoListItem = {
        id: String(nextId++),
        title: body.title.trim(),
        description: body.description?.trim() ?? '',
        status: Number(body.status ?? 1),
        createTime: now,
        updateTime: now,
    }
    records.unshift(item)
    return success(item, '创建成功')
}

/**
 * 更新示例数据
 */
export async function mockDemoUpdate(body: IDemoUpdateBody): Promise<IMockResponse<IDemoListItem>> {
    await mockDelay()
    const error = validateBody(body)
    if (error)
        return fail(error)
    const index = records.findIndex(record => record.id === body.id)
    if (index < 0)
        return fail('数据不存在')
    const updated: IDemoListItem = {
        ...records[index],
        title: body.title.trim(),
        description: body.description?.trim() ?? '',
        status: Number(body.status ?? records[index].status),
        updateTime: formatNow(),
    }
    records[index] = updated
    return success(updated, '更新成功')
}

/**
 * 删除示例数据
 */
export async function mockDemoDelete(ids: string[]): Promise<IMockResponse<null>> {
    await mockDelay()
    if (!ids.length)
        return fail('请选择要删除的数据')
    records = records.filter(item => !ids.includes(item.id))
    return success(null, '删除成功')
}

/**
 * 更新示例状态
 */
export async function mockDemoUpdateStatus(body: IDemoUpdateStatusBody): Promise<IMockResponse<IDemoListItem>> {
    await mockDelay()
    const index = records.findIndex(record => record.id === body.id)
    if (index < 0)
        return fail('数据不存在')
    records[index] = {
        ...records[index],
        status: body.status,
        updateTime: formatNow(),
    }
    return success(records[index], '状态已更新')
}
