<script setup lang="ts">
import {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const isOpen = defineModel<boolean>({ default: false })

interface Props {
    static?: boolean
    closeBtn?: boolean
    size?: 'small' | 'medium' | 'large' | 'full'
    transparent?: boolean
    position?: 'center' | 'left' | 'right'
    fullHeight?: boolean
    background?: 'white' | 'dark'
}
const modalWidthMap = {
    small: 'max-w-md',
    medium: 'max-w-3xl',
    large: 'max-w-6xl',
    full: 'max-w-full'
}
const backgroundMap = {
    white: 'bg-white',
    dark: 'bg-black/30 text-white'
}
const {
    static: isStatic = false,
    closeBtn = true,
    size = 'small',
    transparent = false,
    position = 'center',
    fullHeight = false,
    background = 'white'
} = defineProps<Props>()

function closeModal() {
    if (isStatic) return;
    isOpen.value = false
}
</script>

<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="closeModal" class="relative z-40">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <slot name="backdrop">
                    <div class="fixed inset-0 bg-black/30"></div>
                </slot>
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex h-full items-center p-4 text-center" :class="{
                    'justify-center': position === 'center',
                    'justify-start': position === 'left',
                    'justify-end': position === 'right',
                    '!items-stretch': fullHeight
                }">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="relative w-full max-h-full overflow-auto transform rounded-lg p-3 sm:p-6 text-left align-middle transition-all"
                            :class="modalWidthMap[size], { [backgroundMap[background]]: !transparent, 'shadow-[4px_4px_0_0_rgba(0,0,0,0.07)]': !transparent }">
                            <XMarkIcon v-if="closeBtn" class="size-6 cursor-pointer absolute top-3 right-3 z-20"
                                @click="isOpen = false" @touchend="isOpen = false" />
                            <slot></slot>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>