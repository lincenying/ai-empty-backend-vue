<template>
    <div class="upload-image">
        <div class="upload-box">
            <div v-for="file in imgs" :key="file.fileId" class="img-item">
                <template v-if="!file.loading">
                    <img class="item-thumbnail" :src="`${assetsUrl}${file.accessAddress}`" alt="">
                    <span class="item-actions">
                        <span v-if="isZoom" class="item-btn item-preview" @click="handlePictureCardPreview(`${file.fileId}`)">
                            <el-icon><ZoomIn /></el-icon>
                        </span>
                        <span class="item-btn item-delete" @click="handleRemove(`${file.fileId}`)">
                            <el-icon><DeleteFilled /></el-icon>
                        </span>
                    </span>
                </template>
                <div v-else-if="showGress" class="w-full h-full file-gress">{{ file.progress }}</div>
                <div v-else v-loading="true" class="w-full h-full file-loading"></div>
            </div>
            <el-upload
                v-if="(!limit) || (imgs?.length ?? 0) < limit"
                class="upload-image"
                list-type="picture-card"
                :show-file-list="false"
                :accept="(allowType ?? []).map(m => `.${m}`).join(',')"
                :before-upload="beforeUpload"
                :http-request="upload"
            >
                <el-icon><Plus /></el-icon>
            </el-upload>
        </div>
        <div v-if="isTip" class="text-left tip">{{ tipText }}</div>
    </div>
</template>

<script setup lang="ts">
import type { AxiosProgressEvent } from 'axios'
import type { UploadRequestOptions } from 'element-plus'
import type { UploadFileList } from '~/types/components.types'

import { DeleteFilled, Plus, ZoomIn } from '@element-plus/icons-vue'
import { api as $viewerApi } from 'v-viewer'
import { $axios } from '~/composables/axios'
import { assetsUrl } from '~/config'
import { showMsg } from '~/utils/element'

interface Props {
    /** 上传地址 */
    url?: string
    /** 格式限制 */
    allowType?: string[]
    /** 限制个数，默认0即没有限制 */
    limit?: number
    /** 是否预览大图，默认可以 */
    isZoom?: boolean
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

const { limit = 0, url = '', allowType, size = 0, isTip = true, showGress = true, extraTip = '' } = defineProps<Props>()

const emits = defineEmits<{
    (event: 'validate', palyload: string): void
}>()

const imgs = defineModel<UploadFileList[]>('imgs', { required: false, default: () => [] })

const tipText = computed(() => {
    return [
        allowType && allowType?.length ? `支持文件格式${(allowType ?? []).join('、')}` : '',
        size ? `限制文件大小${size}M` : '',
        extraTip || '',
    ].filter(item => !!item).join('; ')
})

function beforeUpload(file: File) {
    const reg = allowType ? new RegExp(`.*\.(${allowType.join('|')})$`) : false
    if (reg && !reg.test(file.name.toLowerCase())) {
        showMsg(`限制格式${allowType?.join('、')}`)
        return false
    }
    if (size && file.size / 1024 / 1024 > size) {
        showMsg(`限制大小${size}M以内`)
        return false
    }
    if ((limit) && (imgs.value?.length ?? 0) >= limit) {
        return false
    }
}
async function upload(params: UploadRequestOptions) {
    const file = params.file
    const formData = new FormData()
    formData.append('file', file)
    const nowTime = `${Date.now()}`
    imgs.value = [...imgs.value, { loading: true, fileId: `${nowTime}`, progress: 0 }]
    const res = await $axios.post({ url,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress(payload: AxiosProgressEvent) {
            const updateImgs = [...imgs.value].map((item) => {
                if (item.fileId === nowTime) {
                    item.progress = Number(`${(payload.loaded / (payload.total ?? 1) * 100).toFixed(2)}`)
                }
                return item
            })
            imgs.value = [...updateImgs]
        },
    })
    const arr = [...imgs.value].map((item) => {
        if (item.fileId === nowTime) {
            delete item.loading
            delete item.progress
            if (res && res.statusCode === '000000') {
                const fileInfo = parseRes(res)
                item.fileId = fileInfo.fileId
                item.accessAddress = fileInfo.accessAddress
                item.breviaryAddress = fileInfo.breviaryAddress
                return !item.fileId || !item.accessAddress ? null : item
            }
            else {
                return null
            }
        }
        return item
    }).filter(item => !!item)
    imgs.value = [...arr]
    emits('validate', 'change')
}
function parseRes(data: any) {
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
    const arr = [...imgs.value]
    const index = imgs.value.findIndex(m => `${m.fileId}` === id)
    if (index >= 0)
        arr.splice(index, 1)
    imgs.value = arr
    emits('validate', 'change')
}
function handlePictureCardPreview(id: string) {
    const arr = imgs.value.filter(item => !item.loading)
    let idx = 0
    arr.forEach((item, index) => {
        if (item.fileId === id) {
            idx = index
        }
    })
    $viewerApi({
        options: {
            initialViewIndex: idx,
        },
        images: arr.map(item => `${assetsUrl}${item.accessAddress}`),
    })
}
</script>
