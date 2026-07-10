<template>
    <div class="upload-filelist">
        <div class="upload-box">
            <el-upload
                class="upload-btn"
                :disabled="isLimit || disabled" list-type="text" :show-file-list="false"
                :accept="acceptStr" :before-upload="beforeUpload" :http-request="upload"
            >
                <el-button size="small" :disabled="isLimit || disabled">选择文件</el-button>
            </el-upload>
        </div>
        <div v-for="file in files" :key="file.fileId" class="file-item">
            <el-icon class="file-icon">
                <List />
            </el-icon>
            <div class="file-name">
                <div v-if="file.loading" class="name-text">{{ file.fileName }}</div>
                <div v-else class="name-text loadend" @click="downloadFile(file)">{{ file.fileName }}</div>
            </div>
            <template v-if="file.loading">
                <div v-if="showGress" class="file-gress">{{ file.progress }}</div>
                <div v-else v-loading="true" class="file-loading"></div>
            </template>
            <template v-else>
                <el-icon class="item-btn item-delete" @click="handleRemove(`${file.fileId}`)">
                    <DeleteFilled />
                </el-icon>
            </template>
        </div>
        <div v-if="isTip" class="text-left tip">{{ tipText }}</div>
    </div>
</template>

<script setup lang="ts">
import type { AxiosProgressEvent } from 'axios'
import type { UploadRequestOptions } from 'element-plus'
import type { UploadFileList } from '~/types/components.types'

import { DeleteFilled, List } from '@element-plus/icons-vue'
import { $axios } from '~/composables/axios'
import { assetsUrl } from '~/config'
import { showMsg } from '~/utils/element'

interface Props {
    /** 绑定文件数组 */
    files: UploadFileList[]
    /** 上传地址 */
    url?: string
    /** 格式限制 */
    allowType?: string[]
    /** 限制个数，默认0即没有限制 */
    limit?: number
    /** 单次限制数量，默认0即没有限制 */
    onceLimit?: number
    disabled?: boolean
    /** 限制大小，默认0即没有限制 */
    size?: number
    /** 是否显示限制格式和大小提示信息，默认显示 */
    isTip?: boolean
    /** 是否显示进度，默认显示 */
    showGress?: boolean
    /** 额外的提示句 */
    extraTip?: string
    /** 额外参数 */
    extraParams?: Record<string, any>
}

const { files, limit = 0, url = '', allowType, size = 0, isTip = true, showGress = true, extraTip = '', extraParams, disabled } = defineProps<Props>()

const emit = defineEmits(['update:files', 'validate'])

const isLimit = computed(() => {
    const l = Number(limit)
    return l > 0 && (files?.length ?? 0) >= l
})
const limitTip = computed(() => {
    const l = Number(limit)
    return l > 1 ? `最大数量 ${l}` : ''
})

const tipText = computed(() => {
    return [
        allowType && allowType?.length ? `支持文件格式${(allowType ?? []).join('、')}` : '',
        size ? `限制文件大小${size}M` : '',
        limitTip,
        extraTip || '',
    ].filter(m => m).join('; ')
})

const acceptStr = computed(() => {
    return (allowType ?? []).map(m => `.${m}`).join(',')
})

function beforeUpload(file: File) {
    const reg = allowType ? new RegExp(`.*\.(${allowType.join('|')})$`) : false
    if (reg && !reg.test(file.name.toLowerCase())) {
        showMsg(`支持文件格式${allowType?.join('、')}`)
        return false
    }
    if (size && file.size / 1024 / 1024 > size) {
        showMsg(`限制文件大小${size}M以内`)
        return false
    }
    if (isLimit.value || disabled) {
        return false
    }
}
async function upload(params: UploadRequestOptions) {
    const file = params.file
    const formData = new FormData()
    formData.append('file', file)
    if (extraParams) {
        for (const key in extraParams) {
            formData.append(key, extraParams[key])
        }
    }
    const nd = Date.now()
    emit('update:files', [...files, { loading: true, fileName: file?.name ?? '', fileId: nd, progress: '0%' }])
    const res = await $axios.post({ url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(payload: AxiosProgressEvent) {
            const updatefiles = [...files].map((item, index) => {
                if (item.fileId === nd) {
                    item.progress = Number(`${((payload.progress || (payload.loaded / (payload.total ?? 1))) * 100).toFixed(2)}`)
                    if (!item.fileName) {
                        item.fileName = `文件${index + 1}`
                    }
                }
                return item
            })
            emit('update:files', [...updatefiles])
        },
    })
    const arr = [...files].map((item, index) => {
        if (item.fileId === nd) {
            delete item.loading
            delete item.progress
            if (res && res.statusCode === '000000') {
                const result = parseRes(res, index)
                item.fileId = result.fileId
                item.accessAddress = result.accessAddress
                item.breviaryAddress = result.breviaryAddress
                return !item.fileId || !item.accessAddress ? null : item
            }
            else {
                return null
            }
        }
        else {
            return item
        }
    }).filter(m => m)
    emit('update:files', [...arr])
    emit('validate', 'change')
}
function parseRes(data: any, _index: number) {
    let res = data?.result
    res = Array.isArray(res) ? res : (res?.root ?? [])
    const fileId = res[0]?.fileId ?? ''
    const accessAddress = res[0]?.accessAddress ?? ''
    const breviaryAddress = res[0]?.breviaryAddress ?? ''
    return {
        fileId,
        accessAddress,
        breviaryAddress,
    }
}
function handleRemove(id: string) {
    const arr = [...files]
    const index = files.findIndex(m => `${m.fileId}` === id)
    if (index >= 0)
        arr.splice(index, 1)
    emit('update:files', arr)
    emit('validate', 'change')
}
function downloadFile(file: UploadFileList) {
    if (file.loading)
        return
    const link = document.createElement('a')
    link.href = `${assetsUrl}${file.accessAddress}`
    link.download = file?.fileName ?? `文件_${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
</script>
