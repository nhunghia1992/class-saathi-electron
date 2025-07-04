<script setup lang="ts">
import { ClockIcon, PencilIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ContentType, Question, QuestionChoice, QuestionType } from '../types/question.d';
import Button from './Button.vue';
import { computed } from 'vue';
import { isArraysEqual, numberToLetter } from '../utils';
import { useQuestionStore } from '../stores/question';
import { useDeviceStore } from '../stores/device';

const questionStore = useQuestionStore()
const device = useDeviceStore()

const { title = '', question, isPreview = false, isShowCorrectedChoice = false } = defineProps<{
    title?: string
    question: Question,
    isPreview?: boolean,
    isShowCorrectedChoice?: boolean
}>()

const emit = defineEmits<{
    edit: []
    add: [type: QuestionType]
    delete: []
}>()

const gridColClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
}

const questionChoicesOrder = computed<QuestionChoice[]>(() => {
    return JSON.parse(JSON.stringify(question.choices))
        .sort((a: QuestionChoice, b: QuestionChoice) => {
            if (question.type !== QuestionType.sorting) return 0;
            if (!isShowCorrectedChoice) return 0;
            return a.isCorrected - b.isCorrected
        })
})

function getChoiceIndex(choice: QuestionChoice): number {
    return question.choices.findIndex(_choice => _choice.value === choice.value)
}

function getChoiceCorrectedCount(choice: QuestionChoice, index: number): number {
    const choiceIndex = getChoiceIndex(choice)
    return device.studentClickers.filter(clicker => {
        if (question.type === QuestionType.sorting) {
            return clicker.info.answers[questionStore.currentQuestionIndex]?.choices[index] === choiceIndex
        }

        return clicker.info.answers[questionStore.currentQuestionIndex]?.choices.includes(choiceIndex)
    }).length
}

function getChoiceCorrectedPercent(choice: QuestionChoice, index: number): number {
    if (!device.studentClickers.length) return 0;
    return (getChoiceCorrectedCount(choice, index) / device.studentClickers.length) * 100
}

const questionCorrectedCount = computed<number>(() => {
    return device.studentClickers.filter(clicker => {
        const studentChoices = clicker.info.answers[questionStore.currentQuestionIndex]?.choices || []
        const questionCorrectedChoices = JSON.parse(JSON.stringify(question.choices))
            .sort((a: QuestionChoice, b: QuestionChoice) => a.isCorrected - b.isCorrected)
            .map((choice: QuestionChoice) => {
                if (choice.isCorrected) {
                    return getChoiceIndex(choice)
                }

                return null
            })
            .filter((choiceIndex: number) => choiceIndex !== null)
        return isArraysEqual(studentChoices, questionCorrectedChoices, question.type === QuestionType.sorting)
    }).length
})

const questionCorrectedPercent = computed<number>(() => {
    if (!device.studentClickers.length) return 0;
    return (questionCorrectedCount.value / device.studentClickers.length) * 100
})
</script>

<template>
    <div class="p-3 bg-black/20 mb-3 rounded-xl">
        <div class="flex items-center mb-3 gap-2">
            <div v-if="title" class="font-semibold text-lg underline">{{ title }}</div>
            <div class="flex items-center gap-1">
                <ClockIcon class="size-6" :class="{
                    '!size-10 text-amber-300': !isPreview,
                    'text-rose-400': question.timeLimit === 0
                }" />
                <div class="w-8" :class="{
                    'font-semibold text-4xl text-amber-300': !isPreview,
                    'text-rose-400': question.timeLimit === 0
                }">{{ question.timeLimit }}</div>
            </div>

            <template v-if="isPreview">
                <Button color="dark" size="small" @click="emit('edit')">
                    <PencilIcon class="size-6 inline" />
                    Edit
                </Button>
                <Button v-for="questionType in QuestionType" color="dark" size="small"
                    @click="emit('add', questionType)">
                    <PlusCircleIcon class="size-6 inline" />
                    {{ questionType }}
                </Button>
                <Button color="rose" design="pill" class="size-7 !p-0 ml-auto shrink-0" @click="emit('delete')">
                    <XMarkIcon class="size-5" />
                </Button>
            </template>
            <template v-else>
                <div v-if="isShowCorrectedChoice" class="ml-auto text-xl font-semibold text-emerald-300">
                    {{ questionCorrectedPercent.toFixed(0) }}%
                    ({{ questionCorrectedCount }}/{{ device.studentClickers.length }})
                </div>
            </template>
        </div>

        <div class="grid gap-3 mb-5" :class="gridColClass[question.questionColumn]">
            <!-- Question contents -->
            <div class="grid gap-3" :class="gridColClass[question.contentColumn]">
                <div v-for="content in question.contents"
                    class="flex items-center justify-center w-full max-w-3xl mx-auto">
                    <div class="w-full relative">
                        <template v-if="content.value">
                            <div v-if="content.type === ContentType.text"
                                class="whitespace-pre-wrap text-center text-2xl">
                                {{ content.value }}
                            </div>
                            <img v-if="content.type === ContentType.image" :src="content.value" alt="Preview"
                                class="rounded-lg mx-auto max-h-[50vh]" />
                            <audio v-if="content.type === ContentType.audio" :src="content.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" controls />
                            <video v-if="content.type === ContentType.video" :src="content.value" alt="Preview"
                                class="rounded-lg mx-auto max-h-[50vh]" controls />
                        </template>
                    </div>
                </div>
            </div>
            <!-- End Question contents -->

            <!-- Question choices -->
            <div class="grid gap-3 content-center" :class="gridColClass[question.choiceColumn]">
                <div v-for="(choice, index) in questionChoicesOrder"
                    class="flex items-center justify-center gap-5 w-full max-w-3xl mx-auto bg-black/20 py-3 px-4 rounded-lg relative">
                    <div v-if="!isPreview && isShowCorrectedChoice"
                        class="absolute right-1 top-1 z-20 text-xs bg-black/20 py-1 px-2 rounded-full font-semibold  ">
                        {{ getChoiceCorrectedPercent(choice, index).toFixed(0) }}%
                        ({{ getChoiceCorrectedCount(choice, index) }}/{{ device.studentClickers.length }})
                    </div>
                    <div class="shrink-0 flex items-center justify-center size-12 bg-black/20 text-2xl rounded-full font-semibold"
                        :class="{
                            '!bg-emerald-400': isShowCorrectedChoice && choice.isCorrected
                        }">
                        {{ numberToLetter(getChoiceIndex(choice) + 1) }}
                    </div>
                    <div class="w-full relative">
                        <template v-if="choice.value">
                            <div v-if="choice.type === ContentType.text" class="whitespace-pre-wrap text-xl">
                                {{ choice.value }}
                            </div>
                            <img v-if="choice.type === ContentType.image" :src="choice.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" />
                            <audio v-if="choice.type === ContentType.audio" :src="choice.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" controls />
                            <video v-if="choice.type === ContentType.video" :src="choice.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" controls />
                        </template>
                    </div>
                </div>
            </div>
            <!-- End Question choices -->
        </div>
    </div>
</template>