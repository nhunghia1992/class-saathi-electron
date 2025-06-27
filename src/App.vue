<script setup>
import { ref } from 'vue';
import Main from './views/Main.vue';
import Device from './views/Device.vue';
import Question from './views/Question.vue';

const viewComponents = {
    main: Main,
    device: Device,
    question: Question,
};

const view = ref(Object.keys(viewComponents)[0]); // Default to 'main'

function changeView(newView) {
    view.value = newView;
}
</script>

<template>
    <div class="h-screen !h-dvh flex flex-col gap-3 text-gray-700 bg-linear-to-r from-cyan-500 to-blue-500 text-white p-3">
        <div class="flex items-center justify-center">
            <div class="flex rounded-xl bg-blue-950/20 p-1">
                <button v-for="(_, key) in viewComponents" class="py-2 px-4 cursor-pointer rounded-xl capitalize font-semibold" :class="{
                    'bg-white text-blue-950': view === key,
                }" @click="changeView(key)">
                    {{ key }}
                </button>
            </div>
        </div>
        <div class="h-full overflow-auto bg-blue-950/20 rounded-xl p-3">
            <component :is="viewComponents[view]" />
        </div>
    </div>
</template>
