/** 是否需要rem转换 */
export const needRem = true
/**
 * 设计稿宽度（与 global.scss / postcss 转换一致）
 * 组件内尺寸请写 **px**，勿再手写 3800 视口公式；缩放由 html font-size + px→rem 完成
 */
export const designWidth = 1920
/** 设计稿高度 */
export const designHeight = 1080
/** 设计稿倍数 */
export const designMultiple = designWidth / 1920
/** 兼容最小宽度 */
export const minWidth = 1440
/** 兼容最小宽度(px) */
export const minWindow = `${minWidth}Px`
/** 为什么设置 100? 设置成便于计算, 计算rem时只需要将 设计稿的宽度 / 100 即可 */
export const fontSize = 100

export function charsetRemoval() {
    return {
        postcssPlugin: 'internal:charset-removal',
        AtRule: {
            charset: (atRule: any) => {
                if (atRule.name === 'charset') {
                    atRule.remove()
                }
            },
        },
    }
}
