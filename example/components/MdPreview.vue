<template>
	<MdPreview
		:model-value="value"
		theme="dark"
		preview-theme="github"
	></MdPreview>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { MdPreview } from 'md-editor-v3';

import 'md-editor-v3/lib/preview.css';

const props = withDefaults(
	defineProps<{
		modelValue: string;
	}>(),
	{}
);

const emits = defineEmits<{
	(event: 'update:modelValue', value: string): void;
}>();

const value = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emits('update:modelValue', value);
	},
});
</script>

<style lang="scss">
.md-editor-preview-wrapper {
	padding: 0;

	.md-editor-preview {
		background-color: #111;

		.pre {
			margin: rem(20px) 0;
		}

		& > *:last-child {
			margin-bottom: 0;
		}
	}
}
</style>
