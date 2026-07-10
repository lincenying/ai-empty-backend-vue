<template>
    <div class="upload-multi-file">
        <div class="upload-box">
            <el-upload
                class="upload-btn" drag multiple
                :disabled="isLimit || isOnceLimit || disabled" list-type="text"
                :show-file-list="false" :accept="acceptStr" :before-upload="beforeUpload"
                :http-request="upload"
            >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                    将文件拖到此区域上传，或<em>点击上传</em>
                </div>
                <div v-if="isTip" class="text-center tip">
                    <div>{{ allowTypeTip }}</div>
                    <div>{{ sizeTip }}</div>
                    <div v-html="limitTip"></div>
                    <div>{{ extraTip }}</div>
                </div>
            </el-upload>
        </div>
        <div class="file-list-box">
            <div v-for="file, index in filesList" :key="`${file.fileId}_${index}`" class="file-item-box">
                <div class="file-item">
                    <el-icon class="file-icon">
                        <List />
                    </el-icon>
                    <div class="file-name">
                        <div v-if="file.loading" class="name-text">{{ file.fileName }}</div>
                        <div v-else class="name-text">
                            <span v-if="!isAdd" class="loadend" @click="downloadFile(file)">{{ file.fileName }}</span>
                            <el-input v-else v-model="file.filename" placeholder="" size="large" :maxlength="100" clearable>
                                <template #append>{{ file.extension }}</template>
                            </el-input>
                        </div>
                    </div>
                    <template v-if="file.loading"> </template>
                    <template v-else>
                        <el-icon class="item-btn item-delete" @click="handleRemove(`${file.fileId}`)">
                            <DeleteFilled />
                        </el-icon>
                    </template>
                </div>
                <div class="size-item">
                    <template v-if="file.speed">
                        <div class="speed">{{ file.speed }}</div>
                    </template>
                    <template v-if="typeof file.loaded === 'number'">
                        <div class="loaded">{{ formatBytes(file.loaded) }}</div>
                        <div>/</div>
                    </template>
                    <div class="total">{{ formatBytes(file.size) }}</div>
                </div>
                <div>
                    <el-progress
                        v-if="showGress"
                        color="rgba(41, 120, 249, 0.66)" :stroke-width="3"
                        :percentage="file.loading ? file.progress : 100" :status="file.loading ? '' : 'success'"
                    />
                    <div v-else class="file-loading">
                        <el-icon class="loading-icon">
                            <Loading />
                        </el-icon>
                        正在上传...
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AxiosProgressEvent } from 'axios'
import type { UploadRequestOptions } from 'element-plus'
import type { UploadFileList } from '~/types/components.types'

import { DeleteFilled, List, Loading, UploadFilled } from '@element-plus/icons-vue'
import { $axios } from '~/composables/axios'
import { isAddKey, showOldFileKey } from '~/composables/provide'
import { assetsUrl } from '~/config'
import { formatBytes, getFileNameAndExtension } from '~/utils'
import { showMsg } from '~/utils/element'

interface Props {
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

const { limit = 0, onceLimit = 0, url = '', allowType, size = 0, isTip = true, showGress = true, extraTip = '', extraParams, disabled } = defineProps<Props>()

const emits = defineEmits<{
    (e: 'validate', value: string): void
}>()

const files = defineModel<UploadFileList[]>('files', { required: false, default: () => [] })

const isUploading = defineModel<boolean>('is-uploading', { required: true })

const isAdd = inject(isAddKey)
const showOldFile = inject(showOldFileKey, () => {})

const filesList = ref<UploadFileList[]>(files.value.map((item) => {
    return {
        ...item,
        ...getFileNameAndExtension(item.fileName || ''),
    }
}))

watch(() => filesList.value, (val) => {
    files.value = val.map((item) => {
        return {
            ...item,
            fileName: `${item.filename}.${item.extension}`,
        }
    })
    emits('validate', 'change')
}, { deep: true })

const isLimit = computed(() => {
    return limit > 0 && filesList.value.length >= limit
})
const isOnceLimit = computed(() => {
    const isLoadingLen = filesList.value.filter(f => f.loading).length
    return onceLimit > 0 && isLoadingLen >= onceLimit
})
const allowTypeTip = computed(() => {
    return allowType && allowType.length ? `支持文件格式${(allowType ?? []).join('、')}` : ''
})
const sizeTip = computed(() => {
    return size ? `限制文件大小${formatBytes(size)}` : ''
})
const limitTip = computed(() => {
    return [
        limit > 1 && limit < 999 ? `最大数量 ${limit}` : '',
        onceLimit > 1 ? `单次上传最大数量 ${onceLimit}` : '',
    ].filter(m => m).join(';&ensp;')
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
    if (size && file.size > size) {
        showMsg(`限制文件大小${formatBytes(size)}以内`)
        return false
    }
    if (isLimit.value || disabled) {
        // $msg['showMsg'](`超出文件数量限制`)
        return false
    }
}

async function upload(params: UploadRequestOptions) {
    if (isLimit.value || isOnceLimit.value || disabled) {
        return false
    }
    isUploading.value = true
    const file = params.file
    const formData = new FormData()
    formData.append('file', file)
    if (extraParams) {
        for (const key in extraParams) {
            formData.append(key, extraParams[key])
        }
    }
    const fileUid = file.uid
    filesList.value.unshift({
        loading: true,
        fileName: file?.name ?? '',
        fileId: fileUid,
        progress: 0,
        loaded: 0,
        size: file.size,
        updateTime: Date.now(),
        speed: '0b/s',
        ...getFileNameAndExtension(file.name || ''),
    })

    let timeout = 60000 * file.size / (1024 * 1024)
    if (timeout < 60000)
        timeout = 60000

    // updateFileList(filesList.value)
    const res = await $axios.post({ url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout, // 超时时间根据文件大小来定，默认1分钟上传1MB
        onUploadProgress: (row: AxiosProgressEvent) => {
            filesList.value = filesList.value.map((item, index) => {
                if (item.fileId === fileUid) {
                    const nowTime = Date.now()
                    item.speed = `${formatBytes((row.loaded - (item.loaded || 0)) / (nowTime - (item.updateTime || 0)) * 1000, true)}/s`
                    item.progress = Number(((row.progress || (row.loaded / (row.total ?? 1))) * 100).toFixed(2))
                    item.loaded = row.loaded
                    item.size = row.total
                    item.updateTime = nowTime
                    if (!item.fileName) {
                        item.fileName = `文件${index + 1}`
                    }
                    const { filename, extension } = getFileNameAndExtension(item.fileName)
                    item.filename = filename
                    item.extension = extension
                }
                return item
            })
            // updateFileList(filesList.value)
        },
    })
    filesList.value = (filesList.value.map((item, index) => {
        const { filename, extension } = getFileNameAndExtension(item.fileName || '')
        item.filename = filename || ''
        item.fileDescription = filename || ''
        item.extension = extension
        if (item.fileId === fileUid) {
            delete item.loading
            delete item.progress
            delete item.loaded
            delete item.speed
            delete item.updateTime
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
        return item
    }).filter(item => !!item)) as UploadFileList[]

    isUploading.value = false
    // updateFileList(filesList.value)
    showOldFile(false)
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
async function handleRemove(id: string) {
    const { statusCode } = await $axios.post({ url: '', data: { fileIds: [id] } })
    if (statusCode === '000000') {
        filesList.value = filesList.value.filter(f => f.fileId !== id)
    }
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
