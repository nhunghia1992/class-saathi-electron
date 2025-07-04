<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuestionStore } from '../stores/question';
import RenderQuestion from '../components/RenderQuestion.vue';
import { ClickerData, ClickerRole, ClickerType } from '../types/device.d';
import { useDeviceStore } from '../stores/device';
import Clicker from '../components/Clicker.vue';

const device = useDeviceStore()
const question = useQuestionStore()
const defaultCountdownTime = 4
const countdownTime = ref<number>(defaultCountdownTime)
const isShowCorrectedChoice = ref<boolean>(false)
const isShowLeaderboard = ref<boolean>(false)

let countdownIntervalId: NodeJS.Timeout | null = null
let questionTimeIntervalId: NodeJS.Timeout | null = null

function startCountdown() {
    if (countdownIntervalId) {
        clearInterval(countdownIntervalId)
    }

    countdownIntervalId = setInterval(() => {
        if (countdownTime.value > 0) {
            countdownTime.value--
        }
        if (countdownTime.value <= 0 && countdownIntervalId) {
            clearInterval(countdownIntervalId)
            startQuestionTimer()
        }
    }, 1000)
}

function startQuestionTimer() {
    if (questionTimeIntervalId) {
        clearInterval(questionTimeIntervalId)
    }

    questionTimeIntervalId = setInterval(() => {
        if (question.currentQuestion && question.currentQuestion.timeLimit > 0) {
            question.currentQuestion.timeLimit--
        }

        if (question.currentQuestion && question.currentQuestion.timeLimit <= 0 && questionTimeIntervalId) {
            clearInterval(questionTimeIntervalId)
        }
    }, 1000)
}

function clearStudentAnswers() {
    for (const clickerId in device.clickersMap) {
        const clicker = device.clickersMap[clickerId]

        if (clicker.role !== ClickerRole.student) continue;
        if (!clicker.answers[question.currentQuestionIndex]) continue;

        clicker.answers[question.currentQuestionIndex] = {
            choices: [],
            time: null
        }
    }
}

function resetState() {
    if (countdownIntervalId) clearInterval(countdownIntervalId)
    if (questionTimeIntervalId) clearInterval(questionTimeIntervalId)
    countdownTime.value = defaultCountdownTime
    isShowCorrectedChoice.value = false
}

function restartQuestion() {
    if (!question.currentQuestion) return;

    question.currentQuestion = JSON.parse(JSON.stringify(question.data[question.currentQuestionIndex]))
    resetState()
    clearStudentAnswers()
}

watch(() => question.currentQuestionIndex, () => {
    resetState()
})

onMounted(() => {
    window.electron.remoteControl.open();

    window.electron.remoteControl.subscribeEvents((data: ClickerData) => {
        // check event type is user click
        if (data.type !== ClickerType.clicked) return;

        // make sure clicker is registered
        const clickerId = data.payload?.id
        if (!clickerId || !device.clickersMap[clickerId]) return;

        const clicker = device.clickersMap[clickerId]
        // check user role
        if (clicker.role === ClickerRole.teacher) {
            if (data.payload?.value === 1) {
                startCountdown()
            }

            if (data.payload?.value === 2) {
                isShowCorrectedChoice.value = !isShowCorrectedChoice.value
            }

            if (data.payload?.value === 3) {
                isShowLeaderboard.value = !isShowLeaderboard.value
            }

            if (data.payload?.value === 4) {
                clearStudentAnswers()
            }

            if (data.payload?.value === 5) {
                restartQuestion()
            }

            if (data.payload?.value === 6) {
                question.currentQuestionIndex = question.currentQuestionIndex + 1 >= question.data.length ? question.currentQuestionIndex : question.currentQuestionIndex + 1
            }

            if (data.payload?.value === 7) {
                question.currentQuestionIndex = question.currentQuestionIndex === 0 ? 0 : question.currentQuestionIndex - 1
            }
        }

        if (clicker.role === ClickerRole.student) {
            // check if question is started
            if (countdownTime.value) return;

            // check if question is ended
            if (question.currentQuestion && question.currentQuestion.timeLimit <= 0) return;

            // convert input signal value to index and check if it's valid in choice range
            if (!data.payload?.value) return;
            if (!question.currentQuestion?.choices[data.payload.value - 1]) return;

            // re-init answer array
            if (!clicker.answers[question.currentQuestionIndex]) {
                clicker.answers[question.currentQuestionIndex] = {
                    time: null,
                    choices: []
                }
            }

            const valueIndex = data.payload.value - 1

            // make sure user not select same choice and not answer over limit corrected choices
            if (clicker.answers[question.currentQuestionIndex]!.choices.some(index => index === valueIndex)) return;
            if (clicker.answers[question.currentQuestionIndex]!.choices.length >= question.currentQuestion.choices.filter(choice => choice.isCorrected).length) return;
            clicker.answers[question.currentQuestionIndex]!.choices.push(valueIndex)

            // check if user finished answering to set time for answer
            if (clicker.answers[question.currentQuestionIndex]!.choices.length < question.currentQuestion.choices.filter(choice => choice.isCorrected).length) return;
            clicker.answers[question.currentQuestionIndex]!.time = question.data[question.currentQuestionIndex].timeLimit - question.currentQuestion.timeLimit
        }
    });
});

onBeforeUnmount(() => {
    window.electron.remoteControl.unsubscribeEvents();
    window.electron.remoteControl.close();

    resetState()
});
</script>

<template>
    <div class="grid grid-cols-2 gap-3 items-center h-full">
        <RenderQuestion v-if="question.currentQuestion" :question="question.currentQuestion"
            :isShowCorrectedChoice="isShowCorrectedChoice" />
        <div v-if="!isShowLeaderboard"
            class="flex flex-wrap gap-2 items-center justify-center content-start overflow-auto h-full">
            <Clicker v-for="clicker in device.studentClickers" :key="clicker.id" :clickerId="clicker.id"
                :clickerInfo="clicker.info" :isPlaying="true" :isShowCorrectedChoice="isShowCorrectedChoice" />
        </div>
        <div v-else class="flex flex-col justify-start gap-1 overflow-auto h-full">
            <div class="text-center font-semibold text-3xl mb-2">Leaderboard</div>
            <div class="flex bg-black/20 rounded-lg py-2 px-2 gap-2 font-semibold text-lg">
                <div class="w-16 text-center">Rank</div>
                <div class="w-20 text-center">Device</div>
                <div>Name</div>
                <div class="w-20 text-center ml-auto">Correct</div>
                <div class="w-16 text-center">Time</div>
            </div>
            <div v-for="(student, index) in device.studentLeaderboard"
                class="flex bg-black/20 rounded-lg py-1 px-2 gap-2">
                <div class="w-16 text-center font-semibold shrink-0">{{ index + 1 }}</div>
                <div class="w-20 text-center font-semibold shrink-0">{{ student.info.order }}</div>
                <div class="font-semibold truncate">{{ student.info.name }}</div>
                <div class="w-20 text-center ml-auto shrink-0">{{ student.totalCorrected }}</div>
                <div class="w-16 text-center shrink-0">{{ student.totalTime }}</div>
            </div>
        </div>
    </div>
    <div v-if="countdownTime"
        class="absolute inset-0 bg-black/50 flex items-center justify-center font-semibold  transition-all ease-linear duration-1000"
        :class="{
            'backdrop-blur-lg': countdownTime === 4,
            'backdrop-blur-md': countdownTime === 3,
            'backdrop-blur-xs': countdownTime === 2,
            'backdrop-blur-none': countdownTime === 1
        }">
        <span v-if="countdownTime === defaultCountdownTime" class="text-6xl">
            Question {{ question.currentQuestionIndex + 1 }}
        </span>
        <span v-else class="text-9xl">
            {{ countdownTime }}
        </span>
    </div>
</template>