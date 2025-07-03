export interface Question {
    type: QuestionType
    questionColumn: 1 | 2
    contents: QuestionContent[]
    contentColumn: 1 | 2
    choices: QuestionChoice[]
    choiceColumn: 1 | 2 | 3 | 4
}

export enum QuestionType {
    mcq = 'MCQ',
    sorting = 'Sorting'
}

export interface QuestionContent {
    type: ContentType
    value: string
}

export interface QuestionChoice {
    type: ContentType
    value: string
    isCorrected: number
}

export enum ContentType {
    text = 'Text',
    image = 'Image',
    audio = 'Audio',
    video = 'Video'
}