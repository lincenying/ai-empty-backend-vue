export interface IDemoListItem {
    id: string
    title: string
    description: string
    status: number
    createTime?: string
    updateTime: string
}

export interface IDemoListResult {
    records?: IDemoListItem[]
    total: number
}

export interface IDemoListParams {
    title?: string
    status?: string
    currPage?: string
    pageSize?: string
}

export interface IDemoDetail extends IDemoListItem {}

export interface IDemoFormModel {
    title: string
    description: string
    status: string
}

export interface IDemoCreateBody extends IDemoFormModel {}

export interface IDemoUpdateBody extends IDemoFormModel {
    id: string
}

export interface IDemoUpdateStatusBody {
    id: string
    status: number
}

export interface IDemoDeleteBody {
    ids: string[]
}
