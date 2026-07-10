<template>
    <div class="one-column-page" flex="~ col" h-full w-full>
        <page-header :title="DEMO_PAGE_TITLE" :sub-title="DEMO_PAGE_SUB_TITLE" />
        <section class="w-full h-full" flex="~ col" px-20px>
            <div class="header-tools-box">
                <div v-if="auth.READ" class="search-box search-left-box">
                    <div class="search-item">
                        <el-input
                            v-model="searchTitle"
                            class="search-input" size="default" placeholder="请输入标题关键词" clearable
                        >
                            <template #prefix>
                                <el-icon class="el-input__icon"> <Search /> </el-icon>
                            </template>
                        </el-input>
                    </div>
                    <div class="search-item">
                        <el-select
                            v-model="query.status"
                            class="!w-140px search-select" clearable placeholder="状态"
                        >
                            <el-option label="启用" value="1" />
                            <el-option label="禁用" value="0" />
                            <template #prefix>
                                <div class="select-icon i-mdi-circle-double"></div>
                            </template>
                        </el-select>
                    </div>
                    <div class="search-btn-item">
                        <el-button class="search-button" :icon="Refresh" @click="getTableData(true)" />
                    </div>
                </div>
                <div class="btns-box">
                    <el-button v-if="auth.ADD" type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
                    <el-button
                        v-if="auth.BATCH_DELETE || auth.DELETE"
                        type="primary" plain :icon="Delete"
                        @click="handleBatchDelete"
                    >
                        批量删除
                    </el-button>
                </div>
            </div>
            <div class="global-box-table min-h-0 flex-1">
                <global-table
                    ref="globalTableRef"
                    v-loading="loading"
                    prop-key="demo" row-key="id"
                    :border="false" :page="page" :show-selection="true" :show-index="true" :data="tableData"
                    @selection-change="onSelectionChange"
                    @update-page="onUpdatePage"
                >
                    <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
                    <el-table-column prop="description" label="描述" min-width="260" show-overflow-tooltip />

                    <!-- @vue-generic {IDemoListItem} -->
                    <el-table-column label="状态" width="120" align="center">
                        <template #default="{ row }">
                            <el-switch
                                :model-value="row.status === 1"
                                :disabled="!auth.UPDATE || statusUpdatingId === row.id"
                                @change="(value: string | number | boolean) => handleStatusChange(row, value === true)"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column prop="updateTime" label="更新时间" width="180" />

                    <!-- @vue-generic {IDemoListItem} -->
                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <el-button v-if="auth.UPDATE" size="small" :icon="EditPen" link @click="handleEdit(row)" />
                            <el-button v-if="auth.DELETE" size="small" :icon="Delete" link @click="handleDelete(row)" />
                        </template>
                    </el-table-column>
                </global-table>
            </div>
        </section>
        <DialogDemoForm
            v-if="layerForm.show"
            v-model="layerForm"
            @update="(payload: boolean) => (layerForm.show = payload)"
            @success="onFormSuccess"
        />
    </div>
</template>

<script setup lang="ts">
import type { IDemoListItem } from '~/types/demo.types'
import type { GlobalDialogLayer, GlobalTablePage, UpdatePageType } from '~/types/global.types'
import { Delete, EditPen, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { deleteDemo, fetchDemoPage, updateDemoStatus } from '~/api/demo'
import { useDemoAuth } from '~/composables/use-demo-auth'
import { confirmMsg } from '~/utils/element'
import DialogDemoForm from './components/dialog-demo-form.vue'
import { DEMO_PAGE_SUB_TITLE, DEMO_PAGE_TITLE } from './config'

defineOptions({
    name: 'DemoIndex',
    inheritAttrs: true,
})

interface QueryState {
    status: string
}

const router = useRouter()
const { auth, canRead } = useDemoAuth()

if (!canRead.value)
    router.push('/no-auth')

const layerForm: GlobalDialogLayer<{ editId?: string }> = reactive({
    show: false,
    title: '新增',
    showButton: true,
    showCancel: true,
    disabledBtn: false,
    loadingBtn: false,
    row: undefined,
    auth: auth.value,
    width: '640px',
})

watch(auth, (value) => {
    layerForm.auth = value
}, { deep: true })

const searchTitle = ref('')
const searchTitleDebounced = refDebounced(searchTitle, 500)
const [loading, toggleLoading] = useToggle(false)
const tableData = ref<IDemoListItem[]>([])
const selectedRows = ref<IDemoListItem[]>([])
const statusUpdatingId = ref<string | null>(null)
const page: GlobalTablePage = reactive({
    currPage: 1,
    pageSize: 20,
    total: 0,
})
const query = reactive<QueryState>({
    status: '',
})

watch(
    searchTitleDebounced,
    () => {
        getTableData(true)
    },
)

watch(
    () => query.status,
    () => {
        getTableData(true)
    },
)

/**
 * 分页参数更新
 */
function onUpdatePage(payload: UpdatePageType | UpdatePageType[]) {
    if (Array.isArray(payload)) {
        payload.forEach((item) => {
            page[item.key] = item.value
        })
    }
    else {
        page[payload.key] = payload.value
    }
    getTableData(false)
}

/**
 * 拉取示例列表
 */
async function getTableData(init: boolean) {
    if (!auth.value.READ)
        return
    if (init)
        page.currPage = 1
    const { stop } = useTimeoutFn(() => toggleLoading(true), 200)
    try {
        const { result, statusCode } = await fetchDemoPage(
            {
                title: searchTitleDebounced.value || undefined,
                status: query.status || undefined,
                currPage: String(page.currPage),
                pageSize: String(page.pageSize),
            },
            auth.value.READ_path,
        )
        if (statusCode !== '000000')
            return
        tableData.value = result?.records ?? []
        page.total = Number(result?.total ?? 0)
    }
    finally {
        stop()
        toggleLoading(false)
    }
}

getTableData(false)

/**
 * 勾选项变化
 */
function onSelectionChange(rows: IDemoListItem[]) {
    selectedRows.value = rows
}

/**
 * 打开新增弹窗
 */
function handleAdd() {
    layerForm.title = '新增'
    layerForm.row = { editId: undefined }
    layerForm.show = true
}

/**
 * 打开编辑弹窗
 */
function handleEdit(row: IDemoListItem) {
    layerForm.title = '编辑'
    layerForm.row = { editId: String(row.id) }
    layerForm.show = true
}

/**
 * 新增或编辑成功回调
 */
function onFormSuccess() {
    getTableData(true)
}

/**
 * 切换状态
 */
async function handleStatusChange(row: IDemoListItem, enabled: boolean) {
    if (!auth.value.UPDATE)
        return
    const nextStatus = enabled ? 1 : 0
    if (row.status === nextStatus)
        return
    statusUpdatingId.value = row.id
    try {
        const { statusCode } = await updateDemoStatus(
            { id: row.id, status: nextStatus },
            auth.value.UPDATE_path,
        )
        if (statusCode !== '000000')
            return
        ElMessage.success('状态已更新')
        await getTableData(false)
    }
    finally {
        statusUpdatingId.value = null
    }
}

/**
 * 删除单条数据
 */
function handleDelete(row: IDemoListItem) {
    if (!auth.value.DELETE)
        return
    confirmMsg('确认删除该条数据？', async () => {
        const { statusCode } = await deleteDemo(
            [row.id],
            auth.value.DELETE_path,
        )
        if (statusCode !== '000000')
            return
        ElMessage.success('已删除')
        getTableData(tableData.value.length <= 1)
    })
}

/**
 * 批量删除
 */
function handleBatchDelete() {
    if (!selectedRows.value.length) {
        ElMessage.warning('请先勾选要删除的项')
        return
    }
    const path = auth.value.BATCH_DELETE_path || auth.value.DELETE_path
    confirmMsg(`确认删除选中的 ${selectedRows.value.length} 条数据？`, async () => {
        const { statusCode } = await deleteDemo(
            selectedRows.value.map(item => item.id),
            path,
        )
        if (statusCode !== '000000')
            return
        ElMessage.success('已删除')
        getTableData(true)
    })
}
</script>
