import { defineStore } from "pinia";
import { ref } from "vue";
import { Question } from "../types/question.d";

export const useQuestionStore = defineStore("question", () => {
    const data = ref<Question[]>([])

    return {
        data
    }
}, {
    persist: true
})