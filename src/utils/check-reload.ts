interface TimestampData {
    timestamp: string | number
}

/**
 * 时间戳检查器
 */
class TimestampChecker {
    private readonly LOCAL_STORAGE_KEY = 'last_timestamp'
    private readonly CHECK_INTERVAL = 5000 // 5秒
    private readonly API_URL = './timestamp.json'

    private intervalId: number | null = null
    instance: ReturnType<typeof ElNotification> | null = null

    /**
     * 开始定时检查时间戳
     */
    start(): void {
        if (this.intervalId !== null) {
            console.warn('时间戳检查器已经在运行中')
            return
        }

        // 立即执行一次检查
        this.checkTimestamp()

        // 设置定时器
        this.intervalId = window.setInterval(() => {
            this.checkTimestamp()
        }, this.CHECK_INTERVAL)

        console.log('时间戳检查器已启动')
    }

    /**
     * 停止定时检查
     */
    stop(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId)
            this.intervalId = null
            console.log('时间戳检查器已停止')
        }
    }

    /**
     * 检查时间戳
     */
    private async checkTimestamp(): Promise<void> {
        try {
            const remoteTimestamp = await this.fetchTimestamp()
            this.compareTimestamp(remoteTimestamp)
        }
        catch (error) {
            console.error('获取时间戳失败:', error)
        }
    }

    /**
     * 获取远程时间戳
     */
    private async fetchTimestamp(): Promise<string> {
        const response = await fetch(this.API_URL)

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`)
        }

        const data: TimestampData = await response.json()

        // 确保时间戳是字符串类型
        return String(data.timestamp)
    }

    /**
     * 比较时间戳
     */
    private compareTimestamp(remoteTimestamp: string): void {
        const localTimestamp = localStorage.getItem(this.LOCAL_STORAGE_KEY)

        if (localTimestamp === null) {
            // 本地存储为空，写入时间戳
            localStorage.setItem(this.LOCAL_STORAGE_KEY, remoteTimestamp)
            console.log('初始化本地时间戳:', remoteTimestamp)
        }
        else if (localTimestamp !== remoteTimestamp) {
            // 时间戳发生变化，给出提示
            this.notifyTimestampChanged(localTimestamp, remoteTimestamp)

            // 更新本地存储的时间戳
            localStorage.setItem(this.LOCAL_STORAGE_KEY, remoteTimestamp)
        }
        else {
            // 时间戳相同，无变化
            console.debug('时间戳未变化:', remoteTimestamp)
        }
    }

    /**
     * 时间戳变化通知
     */
    private notifyTimestampChanged(oldTimestamp: string, newTimestamp: string): void {
        const message = `时间戳已更新:\n旧时间戳: ${oldTimestamp}\n新时间戳: ${newTimestamp}`

        console.log('时间戳变化通知:', message)

        // 触发自定义事件
        const event = new CustomEvent('timestamp-changed', {
            detail: { oldTimestamp, newTimestamp },
        })
        window.dispatchEvent(event)
    }

    /**
     * 获取当前本地存储的时间戳
     */
    getCurrentTimestamp(): string | null {
        return localStorage.getItem(this.LOCAL_STORAGE_KEY)
    }

    /**
     * 清空本地存储的时间戳
     */
    clearTimestamp(): void {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY)
        console.log('已清空本地时间戳')
    }
}

export default TimestampChecker
