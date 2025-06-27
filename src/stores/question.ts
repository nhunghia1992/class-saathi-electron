import { defineStore } from "pinia";
import { ref } from "vue";

export const useQuestionStore = defineStore("question", () => {
    const data = ref([{
        test: 'test'
    }])

    return {
        data
    }
}, {
    persist: true
})