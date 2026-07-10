import type { IDemoListItem } from '~/types/demo.types'

/**
 * 创建示例模块种子数据
 */
export function createDemoSeed(): IDemoListItem[] {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    return [
        {
            id: '1',
            title: '示例条目一',
            description: '这是第一条示例数据，用于演示列表展示。',
            status: 1,
            createTime: now,
            updateTime: now,
        },
        {
            id: '2',
            title: '示例条目二',
            description: '这是第二条示例数据，状态为禁用。',
            status: 0,
            createTime: now,
            updateTime: now,
        },
        {
            id: '3',
            title: '示例条目三',
            description: '支持关键词搜索与状态筛选。',
            status: 1,
            createTime: now,
            updateTime: now,
        },
        {
            id: '4',
            title: 'Starter Kit',
            description: '基于 Element Plus 的管理端脚手架示例。',
            status: 1,
            createTime: now,
            updateTime: now,
        },
        {
            id: '5',
            title: 'Mock 数据',
            description: '开发环境默认使用内存 Mock，无需后端即可体验 CRUD。',
            status: 1,
            createTime: now,
            updateTime: now,
        },
    ]
}
