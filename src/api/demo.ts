import type {
    IDemoCreateBody,
    IDemoListItem,
    IDemoListParams,
    IDemoListResult,
    IDemoUpdateBody,
    IDemoUpdateStatusBody,
} from '~/types/demo.types'
import { $api } from '~/composables/fetch'
import {
    demoCreateApi,
    demoDeleteApi,
    demoDetailApi,
    demoPageApi,
    demoUpdateApi,
    demoUpdateStatusApi,
} from '~/config/api'
import {
    mockDemoCreate,
    mockDemoDelete,
    mockDemoDetail,
    mockDemoPage,
    mockDemoUpdate,
    mockDemoUpdateStatus,
} from '~/mock/demo/store'

interface IApiPayload<T = unknown> {
    statusCode: string
    message?: string
    result?: T
}

/** 是否启用示例模块 Mock */
const USE_MOCK = import.meta.env.VITE_USE_DEMO_MOCK === 'true'

/**
 * 分页查询示例列表
 */
export async function fetchDemoPage(
    params: IDemoListParams,
    readPath?: string,
): Promise<IApiPayload<IDemoListResult>> {
    if (USE_MOCK)
        return mockDemoPage(params)
    return $api.post<IDemoListResult>(readPath || demoPageApi, params)
}

/**
 * 查询示例详情
 */
export async function fetchDemoDetail(
    id: string,
    readPath?: string,
): Promise<IApiPayload<IDemoListItem>> {
    if (USE_MOCK)
        return mockDemoDetail(id)
    return $api.post<IDemoListItem>(readPath || demoDetailApi, { id })
}

/**
 * 创建示例数据
 */
export async function createDemo(
    body: IDemoCreateBody,
    addPath?: string,
): Promise<IApiPayload<IDemoListItem>> {
    if (USE_MOCK)
        return mockDemoCreate(body)
    return $api.post<IDemoListItem>(addPath || demoCreateApi, body)
}

/**
 * 更新示例数据
 */
export async function updateDemo(
    body: IDemoUpdateBody,
    updatePath?: string,
): Promise<IApiPayload<IDemoListItem>> {
    if (USE_MOCK)
        return mockDemoUpdate(body)
    return $api.post<IDemoListItem>(updatePath || demoUpdateApi, body)
}

/**
 * 删除示例数据
 */
export async function deleteDemo(
    ids: string[],
    deletePath?: string,
): Promise<IApiPayload<null>> {
    if (USE_MOCK)
        return mockDemoDelete(ids)
    return $api.post<null>(deletePath || demoDeleteApi, { ids })
}

/**
 * 更新示例状态
 */
export async function updateDemoStatus(
    body: IDemoUpdateStatusBody,
    updatePath?: string,
): Promise<IApiPayload<IDemoListItem>> {
    if (USE_MOCK)
        return mockDemoUpdateStatus(body)
    return $api.post<IDemoListItem>(updatePath || demoUpdateStatusApi, body)
}
