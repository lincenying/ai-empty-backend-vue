import { webConfig, webRemConfig } from '@lincy/unocss-base-config'
import { fontSize, needRem } from './src/design.config.ts'

/**
 * 注意:
 * Unocss中的尺寸单位说明: 无单位或rem作为单位时, 需以16px的根字号进行书写
 * 项目根字号为100px, 所以需要开启 `noneUnti2Rem` rem单位转换, 否则会按照16px的根字号进行转换
 * 例如: h-20 为 5rem（80px）→ 0.8rem，p-6 为 1.5rem（24px）→ 0.24rem，w-xl / rounded-xl 同理。
 */
const base = needRem ? webRemConfig({ baseFontSize: fontSize, noneUnti2Rem: true }, 'wind3', { preflight: 'on-demand' }) : webConfig('wind3', { preflight: 'on-demand' })

export default {
    ...base,
    shortcuts: [
        ...(Array.isArray(base.shortcuts) ? base.shortcuts : []),
        {
            'shadow-card': 'shadow-[0_1px_3px_0_rgba(16,42,100,0.04),0_4px_16px_-2px_rgba(16,42,100,0.06)]',
            'shadow-card-hover': 'shadow-[0_4px_12px_0_rgba(16,42,100,0.06),0_12px_32px_-4px_rgba(16,42,100,0.10)]',
            'shadow-soft': 'shadow-[0_2px_8px_rgba(16,42,100,0.05)]',
        },
    ],
}
