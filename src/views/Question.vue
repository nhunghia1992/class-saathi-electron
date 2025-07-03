<script setup lang="ts">
import { PlusCircleIcon, XMarkIcon, FilmIcon, MusicalNoteIcon, PhotoIcon, CheckIcon, ClockIcon, CheckBadgeIcon, CheckCircleIcon } from '@heroicons/vue/24/outline';
import { ref } from 'vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';
import { ContentType, Question, QuestionType } from '../types/question.d';
import { useQuestionStore } from '../stores/question';
import FileUploader from '../components/FileUploader.vue';
import RenderQuestion from '../components/RenderQuestion.vue';

const question = useQuestionStore()

const questionModal = ref<boolean>(false)
const questionSelected = ref<Question | null>(null)
const questionSelectedIndex = ref<number | null>(null)
const questionAction = ref<'add' | 'edit'>('add')

const deleteModal = ref<boolean>(false)

const showAnswer = ref<boolean>(false)

const iconMap = {
    [ContentType.text]: PlusCircleIcon,
    [ContentType.image]: PhotoIcon,
    [ContentType.audio]: MusicalNoteIcon,
    [ContentType.video]: FilmIcon
}

const gridColClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
}

function handleAddQuestion(questionType: QuestionType, index: number | null) {
    questionSelected.value = {
        type: questionType,
        questionColumn: 2,
        contents: [],
        contentColumn: 1,
        choices: [],
        choiceColumn: 1,
        timeLimit: 30
    }
    questionAction.value = 'add'
    questionSelectedIndex.value = index
    questionModal.value = true
}

function handleAddQuestionContent(contentType: ContentType) {
    if (!questionSelected.value) return;
    questionSelected.value.contents.push({
        type: contentType,
        value: ''
    })
}

function handleDeleteQuestionContent(index: number) {
    questionSelected.value?.contents.splice(index, 1)
}

function handleAddQuestionChoice(contentType: ContentType) {
    if (!questionSelected.value) return;
    questionSelected.value.choices.push({
        type: contentType,
        value: '',
        isCorrected: 0,
    })
}

function handleDeleteQuestionChoice(index: number) {
    questionSelected.value?.choices.splice(index, 1)
}

function toggleQuestionChoiceIsCorrected(index: number) {
    if (!questionSelected.value) return;

    if (questionSelected.value.type === QuestionType.mcq) {
        questionSelected.value.choices[index].isCorrected = questionSelected.value.choices[index].isCorrected === 0 ? 1 : 0
    }

    if (questionSelected.value.type === QuestionType.sorting) {
        const currentValue = questionSelected.value.choices[index].isCorrected
        if (currentValue) {
            questionSelected.value.choices.filter(choice => choice.isCorrected > currentValue).forEach(choice => choice.isCorrected--)
            questionSelected.value.choices[index].isCorrected = 0
        } else {
            questionSelected.value.choices[index].isCorrected = Math.max(...questionSelected.value.choices.map(choice => choice.isCorrected)) + 1
        }
    }
}

function handleSaveQuestion() {
    if (!questionSelected.value) return;

    if (questionAction.value === 'add') {
        if (questionSelectedIndex.value !== null) {
            question.data.splice(questionSelectedIndex.value + 1, 0, questionSelected.value)
        } else {
            question.data.push(questionSelected.value)
        }
    }

    if (questionAction.value === 'edit' && questionSelectedIndex.value !== null) {
        question.data[questionSelectedIndex.value] = questionSelected.value
    }

    questionModal.value = false
}

function handleEditQuestion(index: number) {
    questionAction.value = 'edit'
    questionSelectedIndex.value = index
    questionSelected.value = JSON.parse(JSON.stringify(question.data[index]))
    questionModal.value = true
}

function handleDeleteQuestion(index: number) {
    questionSelectedIndex.value = index
    deleteModal.value = true
}

function handleDeleteAllQuestion() {
    questionSelectedIndex.value = null
    deleteModal.value = true
}

function handleConfirmDeleteQuestion() {
    if (questionSelectedIndex.value !== null) {
        question.data.splice(questionSelectedIndex.value, 1)
    } else {
        question.data = []
    }
    deleteModal.value = false
}
</script>

<template>
    <div class="flex items-center gap-3 mb-3">
        <h1 class="font-semibold text-lg">Question list</h1>
        <Button v-for="questionType in QuestionType" color="dark" size="small"
            @click="handleAddQuestion(questionType, null)">
            <PlusCircleIcon class="size-6 inline" />
            {{ questionType }}
        </Button>
        <div class="flex items-center gap-2 absolute right-8 z-20">
            <Button v-if="question.data.length" :color="showAnswer ? 'emerald' : 'dark'" size="small"
                @click="showAnswer = !showAnswer">
                <CheckCircleIcon class="size-6 inline" />
                Show answer
            </Button>
            <Button v-if="question.data.length" color="rose" size="small" @click="handleDeleteAllQuestion">
                <XMarkIcon class="size-6 inline" />
                Delete All
            </Button>
        </div>
    </div>

    <RenderQuestion v-for="(questionData, index) in question.data"
        :title="`Question ${index + 1} (${questionData.type})`" :question="questionData" :is-preview="true"
        :is-show-answer="showAnswer" @edit="handleEditQuestion(index)" @add="handleAddQuestion($event, index)"
        @delete="handleDeleteQuestion(index)" />

    <Modal v-model="questionModal" size="full" static>
        <div class="flex items-center gap-2 mb-3">
            <div class="font-semibold text-lg underline">Question {{ questionSelected?.type }}</div>
            <div class="flex items-center gap-1">
                <ClockIcon class="size-6" />
                <input v-if="questionSelected" v-model="questionSelected.timeLimit" type="number" class="w-8" />
            </div>
            <div class="italic">
                (
                <select v-if="questionSelected?.questionColumn" v-model="questionSelected.questionColumn">
                    <option v-for="col in [1, 2]" :value="col">{{ col }}</option>
                </select>
                columns)
            </div>
        </div>

        <div class="grid gap-2 mb-5" :class="gridColClass[questionSelected ? questionSelected.questionColumn : 1]">
            <!-- Add question contents -->
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <div class="font-semibold">Question contents</div>
                    <div class="italic text-sm">
                        (
                        <select v-if="questionSelected?.contentColumn" v-model="questionSelected.contentColumn">
                            <option v-for="col in [1, 2]" :value="col">{{ col }}</option>
                        </select>
                        columns)
                    </div>
                </div>

                <div class="grid gap-2 mb-3"
                    :class="gridColClass[questionSelected ? questionSelected.contentColumn : 1]">
                    <div v-for="(content, index) in questionSelected?.contents"
                        class="flex items-center justify-center w-full max-w-3xl mx-auto">
                        <div class="w-full relative">
                            <button
                                class="absolute top-2 right-2 z-10 flex items-center justify-center size-6 bg-rose-400 rounded-full opacity-50 hover:opacity-100 cursor-pointer"
                                @click="handleDeleteQuestionContent(index)">
                                <XMarkIcon class="size-4 text-white" />
                            </button>
                            <textarea v-if="content.type === ContentType.text" v-model="content.value"
                                class="w-full border-2 border-dashed p-2 rounded-lg block"></textarea>

                            <FileUploader v-else v-model="content.value" :type="content.type" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <Button v-for="contentType in ContentType" color="sky" size="small"
                        @click="handleAddQuestionContent(contentType)">
                        <component :is="iconMap[contentType]" class="size-6 inline" />
                    </Button>
                </div>
            </div>
            <!-- End Add question contents -->

            <!-- Add question choices -->
            <div>
                <div class="flex items-center gap-2 mb-3">
                    <div class="font-semibold ">Question choices</div>
                    <div class="italic text-sm">
                        (
                        <select v-if="questionSelected?.choiceColumn" v-model="questionSelected.choiceColumn">
                            <option v-for="col in [1, 2, 3, 4]" :value="col">{{ col }}</option>
                        </select>
                        columns)
                    </div>
                </div>

                <div class="grid gap-2 mb-3"
                    :class="gridColClass[questionSelected ? questionSelected.choiceColumn : 1]">
                    <div v-for="(choice, index) in questionSelected?.choices"
                        class="flex items-center justify-center w-full max-w-3xl mx-auto">
                        <div class="w-full relative">
                            <button
                                class="absolute top-2 right-2 z-10 flex items-center justify-center size-6 bg-rose-400 rounded-full opacity-50 hover:opacity-100 cursor-pointer"
                                @click="handleDeleteQuestionChoice(index)">
                                <XMarkIcon class="size-4 text-white" />
                            </button>
                            <button
                                class="absolute top-2 right-10 z-10 flex items-center justify-center size-6 bg-neutral-300 rounded-full opacity-50 hover:opacity-100 cursor-pointer"
                                :class="{
                                    '!bg-emerald-400': choice.isCorrected
                                }" @click="toggleQuestionChoiceIsCorrected(index)">
                                <template v-if="choice.isCorrected">
                                    <CheckIcon v-if="questionSelected?.type !== QuestionType.sorting"
                                        class="size-4 text-white" />
                                    <span v-else class="text-white">{{ choice.isCorrected }}</span>
                                </template>

                            </button>
                            <textarea v-if="choice.type === ContentType.text" v-model="choice.value"
                                class="w-full border-2 border-dashed p-2 rounded-lg block"></textarea>

                            <FileUploader v-else v-model="choice.value" :type="choice.type" />
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <Button v-for="contentType in ContentType" color="sky" size="small"
                        @click="handleAddQuestionChoice(contentType)">
                        <component :is="iconMap[contentType]" class="size-6 inline" />
                    </Button>
                </div>
            </div>
            <!-- End Add question choices -->
        </div>

        <div class="flex items-center justify-center gap-2">
            <Button color="emerald" @click="handleSaveQuestion">Save</Button>
            <Button color="rose" @click="questionModal = false">Cancel</Button>
        </div>
    </Modal>

    <Modal v-model="deleteModal">
        <div class="text-center font-semibold mb-3">Confirm delete question?</div>
        <div class="flex items-center justify-center gap-2">
            <Button color="emerald" class="font-semibold" @click="handleConfirmDeleteQuestion">Yes</Button>
            <Button color="rose" class="font-semibold" @click="deleteModal = false">No</Button>
        </div>
    </Modal>
</template>