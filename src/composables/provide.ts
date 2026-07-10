export const isAddKey = Symbol('IsAddKey') as InjectionKey<MaybeRefOrGetter<boolean>>
export const showOldFileKey = Symbol('ShowOldFileKey') as InjectionKey<(payload: boolean) => void>
