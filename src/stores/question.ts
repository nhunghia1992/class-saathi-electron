import { defineStore } from "pinia";
import { ref, watchEffect } from "vue";
import { Question } from "../types/question.d";

export const useQuestionStore = defineStore("question", () => {
    const data = ref<Question[]>([])
    const currentQuestionIndex = ref<number>(0)
    const currentQuestion = ref<Question | null>(null)

    watchEffect(() => {
        if (data.value[currentQuestionIndex.value]) {
            currentQuestion.value = JSON.parse(JSON.stringify(data.value[currentQuestionIndex.value]))
        } else {
            currentQuestionIndex.value = 0
            currentQuestion.value = data.value[0] ? JSON.parse(JSON.stringify(data.value[0])) : null
        }
    })

    return {
        data,
        currentQuestionIndex,
        currentQuestion
    }
}, {
    persist: true
})