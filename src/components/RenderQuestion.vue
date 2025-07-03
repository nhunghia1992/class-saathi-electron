<script setup lang="ts">
import { ClockIcon, PencilIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { ContentType, Question, QuestionChoice, QuestionType } from '../types/question.d';
import Button from './Button.vue';
import { computed } from 'vue';

const { title = '', question, isPreview = false, isShowAnswer = false } = defineProps<{
    title?: string
    question: Question,
    isPreview?: boolean,
    isShowAnswer?: boolean
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
    const choices = JSON.parse(JSON.stringify(question.choices))
    return choices.sort((a: QuestionChoice, b: QuestionChoice) => {
        if (question.type !== QuestionType.sorting) return 0;
        if (!isShowAnswer) return 0;
        return a.isCorrected - b.isCorrected
    })
})

function numberToLetter(number: number) {
    if (number < 1 || number > 26) return null;
    return String.fromCharCode(64 + number); // 'A' is char code 65
}
</script>

<template>
    <div class="p-3 bg-black/20 mb-3 rounded-xl">
        <div class="flex items-center mb-3 gap-2">
            <div v-if="title" class="font-semibold text-lg underline">{{ title }}</div>
            <div class="flex items-center gap-1">
                <ClockIcon class="size-6" />
                <div class="w-8">{{ question.timeLimit }}</div>
            </div>
            <Button v-if="isPreview" color="dark" size="small" @click="emit('edit')">
                <PencilIcon class="size-6 inline" />
                Edit
            </Button>
            <Button v-if="isPreview" v-for="questionType in QuestionType" color="dark" size="small"
                @click="emit('add', questionType)">
                <PlusCircleIcon class="size-6 inline" />
                {{ questionType }}
            </Button>
            <Button v-if="isPreview" color="rose" design="pill" class="size-7 !p-0 ml-auto shrink-0" @click="emit('delete')">
                <XMarkIcon class="size-5" />
            </Button>
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
                                class="w-full rounded-lg mx-auto" />
                            <audio v-if="content.type === ContentType.audio" :src="content.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" controls />
                            <video v-if="content.type === ContentType.video" :src="content.value" alt="Preview"
                                class="w-full rounded-lg mx-auto" controls />
                        </template>
                    </div>
                </div>
            </div>
            <!-- End Question contents -->

            <!-- Question choices -->
            <div class="grid gap-3" :class="gridColClass[question.choiceColumn]">
                <div v-for="choice in questionChoicesOrder"
                    class="flex items-center justify-center gap-5 w-full max-w-3xl mx-auto bg-black/20 py-3 px-4 rounded-lg">
                    <div class="shrink-0 flex items-center justify-center size-12 bg-black/20 text-2xl rounded-full font-semibold"
                        :class="{
                            '!bg-emerald-400': isShowAnswer && choice.isCorrected
                        }">
                        {{numberToLetter(question.choices.findIndex(_choice => _choice.value === choice.value) + 1)}}
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