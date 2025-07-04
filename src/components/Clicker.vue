<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { UserIcon } from '@heroicons/vue/24/solid';
import { ClickerInfo, ClickerRole } from '../types/device.d';
import { computed, ref, watch } from 'vue';
import Modal from './Modal.vue';
import Button from './Button.vue';
import { useQuestionStore } from '../stores/question';
import { numberToLetter } from '../utils';
import { QuestionType } from '../types/question.d';

const { clickerId, clickerInfo, isPlaying = false, isShowCorrectedChoice = false } = defineProps<{
    clickerId: string
    clickerInfo: ClickerInfo
    isPlaying?: boolean
    isShowCorrectedChoice?: boolean
}>()

const question = useQuestionStore()

const updateInfo = ref<ClickerInfo>({ ...clickerInfo })

const emit = defineEmits<{
    delete: [id: string]
    update: [id: string, info: ClickerInfo]
}>()

const deleteModal = ref<boolean>(false)
const updateModal = ref<boolean>(false)

const isStudentFinishedAnswer = computed<boolean>(() => {
    if (
        clickerInfo.role === ClickerRole.student
        && isPlaying
        && question.currentQuestion
        && clickerInfo.answers[question.currentQuestionIndex]
        && (clickerInfo.answers[question.currentQuestionIndex]?.choices.length || 0) > 0
        && (clickerInfo.answers[question.currentQuestionIndex]?.choices.length || 0) >= (question.currentQuestion?.choices?.filter(choice => choice.isCorrected)?.length || 0)
    ) {
        return true
    }

    return false
})

function handleConfirmDelete() {
    emit('delete', clickerId)
    deleteModal.value = false
}

function handleShowUpdateInfo() {
    if (isPlaying) return;
    updateModal.value = true
}

function handleSubmitUpdateInfo() {
    if (updateInfo.value.order) {
        updateInfo.value.order = Number(updateInfo.value.order)
    }
    emit('update', clickerId, updateInfo.value)
    updateModal.value = false
}

function isChoiceCorrected(choiceIndex: number, index: number) {
    if (question.currentQuestion?.type !== QuestionType.sorting) {
        return question.currentQuestion?.choices[choiceIndex].isCorrected
    }

    return question.currentQuestion?.choices[choiceIndex].isCorrected === index + 1
}

watch(updateModal, () => {
    if (!updateModal.value) return;
    updateInfo.value = { ...clickerInfo }
})
</script>

<template>
    <div class="relative shrink inline-flex items-center bg-black/20 rounded-xl overflow-hidden">
        <XMarkIcon v-if="!isPlaying" class="size-4 absolute right-2 top-2 cursor-pointer" @click="deleteModal = true" />
        <div class="p-3 bg-black/20" :class="{
            '!bg-emerald-400/70': !isPlaying ? clickerInfo.highlight : isStudentFinishedAnswer
        }">
            <div class="flex items-center justify-center p-2 size-11 border-2 border-white rounded-full cursor-pointer"
                @click="handleShowUpdateInfo">
                <UserIcon v-if="clickerInfo.role === ClickerRole.teacher" class="size-7" />
                <div v-else class="text-xl font-semibold">{{ clickerInfo.order }}</div>
            </div>
        </div>
        <div class="p-3 text-sm">
            <div class="w-40 truncate font-semibold">{{ clickerInfo.name }}</div>
            <div v-if="!isPlaying" class="w-40 truncate text-xs">{{ clickerId }}</div>
            <div v-else class="flex gap-1 mt-1 w-full overflow-auto">
                <div v-for="(choiceIndex, index) in clickerInfo.answers[question.currentQuestionIndex]?.choices"
                    class="flex items-center justify-center font-semibold text-xs size-4.5 rounded-full bg-black/20"
                    :class="{
                        '!bg-emerald-400/70': isShowCorrectedChoice && isChoiceCorrected(choiceIndex, index),
                        '!bg-rose-400/70': isShowCorrectedChoice && !isChoiceCorrected(choiceIndex, index)
                    }">
                    <span v-if="question.currentQuestion?.type === QuestionType.sorting || isShowCorrectedChoice">
                        {{ numberToLetter(choiceIndex + 1) }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <Modal v-model="deleteModal">
        <div class="text-center font-semibold mb-3">Confirm delete clicker</div>
        <div class="flex flex-col items-center gap-2 mb-3">
            <div class="text-center text-lg font-semibold">{{ clickerId }}</div>
            <div v-if="clickerInfo.role === ClickerRole.student" class="flex items-center gap-2">
                <div class="font-semibold">Order:</div>
                <div class="py-1 px-2">{{ clickerInfo.order }}</div>
            </div>
            <div class="flex items-center gap-2">
                <div class="font-semibold">Name:</div>
                <div class="py-1 px-2">{{ clickerInfo.name }}</div>
            </div>
        </div>
        <div class="flex items-center justify-center gap-2">
            <Button color="emerald" class="font-semibold" @click="handleConfirmDelete">Yes</Button>
            <Button color="rose" class="font-semibold" @click="deleteModal = false">No</Button>
        </div>
    </Modal>

    <Modal v-model="updateModal">
        <div class="text-center font-semibold mb-3">Update clicker info</div>
        <form @submit.prevent="handleSubmitUpdateInfo">
            <div class="flex flex-col items-center gap-2 mb-3">
                <div class="text-center text-lg font-semibold">{{ clickerId }}</div>
                <div v-if="clickerInfo.role === ClickerRole.student" class="flex items-center gap-2">
                    <div class="font-semibold">Order</div>
                    <input v-model="updateInfo.order" class="border py-1 px-2 rounded-lg" type="number" min="1" />
                </div>
                <div class="flex items-center gap-2">
                    <div class="font-semibold">Name</div>
                    <input v-model="updateInfo.name" class="border py-1 px-2 rounded-lg" />
                </div>
            </div>
            <div class="flex items-center justify-center gap-2">
                <Button color="emerald" class="font-semibold" type="submit">Save</Button>
                <Button color="rose" class="font-semibold" type="button" @click="updateModal = false">Cancel</Button>
            </div>
        </form>
    </Modal>
</template>