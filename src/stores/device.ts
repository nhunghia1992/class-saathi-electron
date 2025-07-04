import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { ClickerInfo, ClickerRole } from "../types/device.d";
import { useQuestionStore } from "./question";
import { QuestionChoice, QuestionType } from "../types/question.d";
import { isArraysEqual } from "../utils";

export const useDeviceStore = defineStore("device", () => {
    const question = useQuestionStore()

    const clickersMap = ref<{
        [id: string]: ClickerInfo
    }>({})

    const clickers = computed<{
        id: string,
        info: ClickerInfo
    }[]>(() => {
        return Object.keys(clickersMap.value)
            .map((id) => {
                return {
                    id: id,
                    info: clickersMap.value[id]
                }
            })
    })

    const teacherClickers = computed<{
        id: string,
        info: ClickerInfo
    }[]>(() => {
        return clickers.value.filter(clicker => clicker.info.role === ClickerRole.teacher)
    })

    const studentClickers = computed<{
        id: string,
        info: ClickerInfo
    }[]>(() => {
        return clickers.value.filter(clicker => clicker.info.role === ClickerRole.student).sort((a, b) => {
            if (a.info.order && !b.info.order) return -1;
            if (!a.info.order && b.info.order) return 1;
            if (a.info.order && b.info.order) return a.info.order - b.info.order;
            return 0
        })
    })

    const studentLeaderboard = computed<{
        info: ClickerInfo,
        totalCorrected: number
        totalTime: number
    }[]>(() => {
        return studentClickers.value
            .map(clicker => {
                const total = clicker.info.answers.reduce<{ corrected: number, time: number }>((_total, answer, index) => {
                    // check if answer is correct
                    const studentChoices = answer?.choices || []
                    const questionCorrectedChoices = JSON.parse(JSON.stringify(question.data[index].choices))
                        .sort((a: QuestionChoice, b: QuestionChoice) => a.isCorrected - b.isCorrected)
                        .map((choice: QuestionChoice) => {
                            if (choice.isCorrected) {
                                return question.data[index].choices.findIndex(_choice => _choice.value === choice.value)
                            }

                            return null
                        })
                        .filter((choiceIndex: number) => choiceIndex !== null)

                    if (isArraysEqual(studentChoices, questionCorrectedChoices, question.data[index].type === QuestionType.sorting)) {
                        _total.corrected++
                        _total.time += answer?.time || 0
                    }
                    return _total
                }, {
                    corrected: 0,
                    time: 0
                })
                return {
                    info: clicker.info,
                    totalCorrected: total.corrected,
                    totalTime: total.time
                }
            })
            .sort((a, b) => {
                if (b.totalCorrected !== a.totalCorrected) {
                    return b.totalCorrected - a.totalCorrected; // Descending
                }
                return a.totalTime - b.totalTime; // Ascending
            })
    })

    function addClicker(clickerId: string | null | undefined, clickerInfo: ClickerInfo) {
        if (!clickerId) return;
        clickersMap.value[clickerId] = clickerInfo
    }

    function deleteClicker(clickerId: string) {
        delete clickersMap.value[clickerId]
    }

    function deleteAllClickers(clickerRole?: ClickerRole) {
        if (clickerRole === ClickerRole.teacher) {
            teacherClickers.value.forEach(clicker => delete clickersMap.value[clicker.id])
            return
        }
        if (clickerRole === ClickerRole.student) {
            studentClickers.value.forEach(clicker => delete clickersMap.value[clicker.id])
            return
        }
        clickersMap.value = {}
    }

    return {
        clickersMap,
        teacherClickers,
        studentClickers,
        studentLeaderboard,
        addClicker,
        deleteClicker,
        deleteAllClickers
    }
}, {
    persist: true
})