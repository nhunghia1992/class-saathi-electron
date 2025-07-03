export interface ClickerInfo {
    order?: number
    name?: string
    role: ClickerRole
    highlight: boolean
    answers: Array<ClickerAnswer | null>
}

export interface ClickerAnswer {
    time: number | null
    choices: number[]
}

export enum ClickerRole {
    teacher,
    student
}

export interface ClickerData {
    type: ClickerType
    payload?: {
        id: string
        classNumber: number
        studentNumber: number
        value: number
        voltage: number
    }
    data: Uint8Array
}

export enum ClickerType {
    registered = 'registered',
    clicked = 'clicked',
    open = 'opened'
}