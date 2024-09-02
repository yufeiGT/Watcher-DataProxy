<template>
	<Flex vert="auto" gap align="center">
		<Flex class="name">Watcher</Flex>
		<Flex hor="auto" :gap="5">
			<Flex>对象观察者 v0.0.1，查看</Flex>
			<RouterLink to="/guide">指南</RouterLink>
		</Flex>
		<Flex sandbox>
			<MdPreviewVue :model-value="(installMd as any)"></MdPreviewVue>
		</Flex>
	</Flex>
</template>

<script lang="ts" setup>
import { Flex } from '@kotron/fortress-ui';

import MdPreviewVue from '@/components/MdPreview.vue';

import installMd from './install.md';
</script>

<style lang="scss" scoped>
.name {
	font-size: rem(30px);
}

a {
	color: #d3d35a;

	&:hover {
		text-decoration: underline;
	}
}
</style>
