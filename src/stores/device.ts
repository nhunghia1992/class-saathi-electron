import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { ClickerInfo, ClickerRole } from "../types/device.d";

export const useDeviceStore = defineStore("device", () => {
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

    const teacherClickers = computed(() => {
        return clickers.value.filter(clicker => clicker.info.role === ClickerRole.teacher)
    })

    const studentClickers = computed(() => {
        return clickers.value.filter(clicker => clicker.info.role === ClickerRole.student).sort((a, b) => {
            if (a.info.order && !b.info.order) return -1;
            if (!a.info.order && b.info.order) return 1;
            if (a.info.order && b.info.order) return a.info.order - b.info.order;
            return 0
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
        addClicker,
        deleteClicker,
        deleteAllClickers
    }
}, {
    persist: true
})