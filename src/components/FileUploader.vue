<script setup lang="ts">
import { computed } from 'vue';
import { ContentType } from '../types/question.d';
import { FilmIcon, MusicalNoteIcon, PhotoIcon } from '@heroicons/vue/24/outline';

const model = defineModel<string>({ default: '' })
const { type } = defineProps<{
    type: ContentType
}>()

const iconMap = {
    [ContentType.image]: PhotoIcon,
    [ContentType.audio]: MusicalNoteIcon,
    [ContentType.video]: FilmIcon
}

const acceptFileTypes = computed<string>(() => {
    if (type === ContentType.image) {
        return 'image/*'
    }

    if (type === ContentType.audio) {
        return 'audio/*'
    }

    if (type === ContentType.video) {
        return 'video/*'
    }

    return '*'
})

function onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const buffer = new Uint8Array(arrayBuffer);

        const savedPath = await window.electron.saveFile(buffer, file.name);
        model.value = savedPath
    };

    reader.readAsArrayBuffer(file);
}
</script>

<template>
    <div class="border-2 border-dashed border-neutral-500 rounded-lg p-2">
        <template v-if="model">
            <img v-if="type === ContentType.image" :src="model" alt="Preview" class="rounded-lg mx-auto mb-2 max-h-[50vh]" />
            <audio v-if="type === ContentType.audio" :src="model" alt="Preview" class="w-full rounded-lg mx-auto mb-2"
                controls />
            <video v-if="type === ContentType.video" :src="model" alt="Preview" class="rounded-lg mx-auto mb-2 max-h-[50vh]"
                controls />
        </template>
        <div class="flex items-center gap-2">
            <component :is="iconMap[type]" class="size-8 shrink-0" />
            <input type="file" :accept="acceptFileTypes" @change="onFileChange" class="block w-full mx-auto text-sm italic" />
        </div>
    </div>
</template>