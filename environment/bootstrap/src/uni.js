export const platform = (
    typeof window === 'object' &&
    typeof window.document === 'object' &&
    window === this ?
    'browser' : 'node'
)

export const environment = 'development'
