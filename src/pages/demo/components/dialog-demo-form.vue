<template>
    <global-dialog
        ref="layerDom"
        :layer="layer"
        :close-on-click-modal="false"
        class="global-dialog"
        cancel-text="取消"
        @update="onUpdate"
        @confirm="handleSubmit"
    >
        <el-form
            ref="formRef"
            v-loading="detailLoading"
            :model="form" :rules="rules" label-width="100px" status-icon
        >
            <el-form-item label="标题" prop="title">
                <el-input
                    v-model="form.title"
                    placeholder="请输入标题"
                    :maxlength="DEMO_TITLE_MAX_LEN"
                    show-word-limit
                />
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入描述"
                    :maxlength="DEMO_DESCRIPTION_MAX_LEN"
                    show-word-limit
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status">
                    <el-radio value="1">启用</el-radio>
                    <el-radio value="0">禁用</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </global-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { GlobalDialogInstance } from '~/types/components.types'
import type { IDemoFormModel } from '~/types/demo.types'
import type { GlobalDialogLayer } from '~/types/global.types'
import { createDemo, fetchDemoDetail, updateDemo } from '~/api/demo'
import { DEMO_DESCRIPTION_MAX_LEN, DEMO_TITLE_MAX_LEN } from '../config'

defineOptions({ name: 'DialogDemoForm' })

const emit = defineEmits<{
    (e: 'success'): void
    (e: 'update', v: boolean): void
}>()

const layer = defineModel<GlobalDialogLayer<{ editId?: string }>>({ required: true })

/** @ts-ignore 未使用 */
const layerDom = useTemplateRef<GlobalDialogInstance>('layerDom')

const editId = computed(() => layer.value.row?.editId)
const isEdit = computed(() => Boolean(editId.value))

const formRef = useTemplateRef<FormInstance>('formRef')
const form = reactive<IDemoFormModel>(createDefaultForm())
const detailLoading = ref(false)

const rules: FormRules<IDemoFormModel> = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

/**
 * 创建默认表单模型
 */
function createDefaultForm(): IDemoFormModel {
    return {
        title: '',
        description: '',
        status: '1',
    }
}

/**
 * 拉取编辑详情并回填表单
 */
async function loadDetail() {
    if (!editId.value)
        return
    detailLoading.value = true
    try {
        const { result, statusCode } = await fetchDemoDetail(editId.value)
        if (statusCode !== '000000' || !result)
            return
        form.title = result.title ?? ''
        form.description = result.description ?? ''
        form.status = String(result.status ?? '1')
    }
    finally {
        detailLoading.value = false
    }
}

watch(
    () => layer.value.show,
    async (open) => {
        if (!open)
            return
        Object.assign(form, createDefaultForm())
        formRef.value?.clearValidate()
        if (editId.value)
            await loadDetail()
    },
    { immediate: true },
)

/**
 * 提交新增或编辑
 */
async function handleSubmit() {
    try {
        await formRef.value?.validate()
    }
    catch {
        return
    }
    layer.value.loadingBtn = true
    try {
        const payload = {
            title: form.title,
            description: form.description,
            status: form.status,
        }
        const { statusCode } = isEdit.value && editId.value ? await updateDemo({ id: editId.value, ...payload }, layer.value.auth.UPDATE_path) : await createDemo(payload, layer.value.auth.ADD_path)
        if (statusCode !== '000000')
            return
        ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
        onUpdate(false)
        emit('success')
    }
    finally {
        layer.value.loadingBtn = false
    }
}

function onUpdate(payload: boolean) {
    if (!payload)
        formRef.value?.clearValidate()
    emit('update', payload)
}
</script>
