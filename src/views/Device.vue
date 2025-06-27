<script setup lang="ts">
import { PlusCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import { StopCircleIcon } from '@heroicons/vue/24/solid';
import Button from '../components/Button.vue';
import Clicker from '../components/Clicker.vue';
import { ClickerData, ClickerInfo, ClickerRole, ClickerType } from '../types/device.d';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useDeviceStore } from '../stores/device';
import Modal from '../components/Modal.vue';

const device = useDeviceStore()

const registerRole = ref<ClickerRole | null>(null)
const deleteAllModal = ref<boolean>(false)
const deleteAllRole = ref<ClickerRole>(ClickerRole.teacher)

function startRegister() {
    const classNumber = 255
    const studentNumber = 255
    const clickerNumer = 8
    window.electron.remoteControl.startRegister(classNumber, studentNumber, clickerNumer)
}

function finishRegister() {
    window.electron.remoteControl.finishRegister();
}

onMounted(() => {
    window.electron.remoteControl.open();

    window.electron.remoteControl.subscribeEvents((data: ClickerData) => {
        if (data.type === ClickerType.registered) {
            finishRegister()
            device.addClicker(data.payload?.id, {
                role: registerRole.value ?? ClickerRole.student,
                highlight: false
            })

            // loop register another device until stop
            setTimeout(() => {
                startRegister()
            }, 500)
        }

        if (data.type === ClickerType.clicked) {
            const clickerId = data.payload?.id
            if (clickerId && device.clickersMap[clickerId]) {
                device.clickersMap[clickerId].highlight = true
                setTimeout(() => {
                    device.clickersMap[clickerId].highlight = false
                }, 500)
            }
        }
    });
});

onBeforeUnmount(() => {
    window.electron.remoteControl.unsubscribeEvents();
    window.electron.remoteControl.close();
});

watch(registerRole, () => {
    if (registerRole.value !== null) {
        startRegister()
    } else {
        finishRegister()
    }
})

function handleClickerUpdate(clickerId: string, updateInfo: ClickerInfo) {
    device.addClicker(clickerId, updateInfo)
}

function handleClickerDelete(clickerId: string) {
    device.deleteClicker(clickerId)
}

function handleConfirmDeleteAll() {
    device.deleteAllClickers(deleteAllRole.value)
    deleteAllModal.value = false
}
</script>

<template>
    <div class="flex items-center gap-3 mb-3">
        <h1 class="font-semibold text-lg">Teacher Clicker</h1>
        <Button v-if="registerRole === null" color="dark" size="small" @click="registerRole = ClickerRole.teacher">
            <PlusCircleIcon class="size-6 inline" />
            Add clicker
        </Button>
        <Button v-else color="dark" size="small" @click="registerRole = null">
            <StopCircleIcon class="size-6 inline" />
            Stop
        </Button>
        <Button v-if="Object.keys(device.teacherClickers).length" color="rose" size="small"
            @click="deleteAllModal = true; deleteAllRole = ClickerRole.teacher">
            <XMarkIcon class="size-6 inline" />
            Delete All
        </Button>
    </div>
    <div class="flex flex-wrap items-start gap-3 mb-10 min-h-20">
        <Clicker v-for="clicker in device.teacherClickers" :key="clicker.id" :clickerId="clicker.id"
            :clickerInfo="clicker.info" @update="handleClickerUpdate" @delete="handleClickerDelete" />
    </div>

    <div class="flex items-center gap-3 mb-3">
        <h1 class="font-semibold text-lg">Student Clickers</h1>
        <Button v-if="registerRole === null" color="dark" size="small" @click="registerRole = ClickerRole.student">
            <PlusCircleIcon class="size-6 inline" />
            Add clicker
        </Button>
        <Button v-else color="dark" size="small" @click="registerRole = null">
            <StopCircleIcon class="size-6 inline" />
            Stop
        </Button>
        <Button v-if="device.studentClickers.length" color="rose" size="small"
            @click="deleteAllModal = true; deleteAllRole = ClickerRole.student">
            <XMarkIcon class="size-6 inline" />
            Delete All
        </Button>
    </div>
    <div class="flex flex-wrap gap-3">
        <Clicker v-for="clicker in device.studentClickers" :key="clicker.id" :clickerId="clicker.id"
            :clickerInfo="clicker.info" @update="handleClickerUpdate" @delete="handleClickerDelete" />
    </div>

    <Modal v-model="deleteAllModal">
        <div class="text-center font-semibold mb-3">Confirm delete all clickers</div>
        <div class="flex items-center justify-center gap-2">
            <Button color="emerald" class="font-semibold" @click="handleConfirmDeleteAll">Yes</Button>
            <Button color="rose" class="font-semibold" @click="deleteAllModal = false">No</Button>
        </div>
    </Modal>
</template>