<script setup lang="ts">

interface Props {
    color?: 'dark' | 'emerald' | 'rose' | 'sky'
    fill?: 'solid' | 'outline'
    size?: 'small' | 'normal' | 'large'
    design?: 'rounded' | 'pill'
    disabled?: boolean
}

const variantClass = {
    dark: {
        solid: "text-white bg-black/20",
        outline: ""
    },
    emerald: {
        solid: "text-white bg-emerald-400"
    },
    rose: {
        solid: "text-white bg-rose-400"
    },
    sky: {
        solid: 'text-white bg-sky-400'
    }
}

const sizeClass = {
    small: 'px-3 py-1 text-sm',
    normal: 'px-5 py-2 text-base',
    large: 'px-7 py-3 text-xl'
}

const designClass = {
    rounded: 'rounded-md',
    pill: 'rounded-full'
}

const {
    color = 'dark',
    fill = 'solid',
    size = 'normal',
    design = 'rounded',
    disabled = false
} = defineProps<Props>()
</script>

<template>
    <button tabindex="-1" class="flex justify-center items-center gap-2 transition-all cursor-pointer" :class="[
        variantClass[color][fill],
        sizeClass[size],
        designClass[design],
        {
            'cursor-not-allowed': disabled,
        }
    ]" :disabled="disabled">
        <slot></slot>
    </button>
</template>