<template>
	<ConfigProvider size="small">
		<Flex vert>
			<Flex
				hor="auto"
				:auto="50"
				gap
				:pad="[0, true]"
				:align="['space-between', 'center']"
				style="border-bottom: solid 1px #666"
			>
				<Flex hor="auto" gap>
					<a @click="to('Home')" class="name">@kotron/watcher</a>
					<span class="version">v0.0.1</span>
				</Flex>
				<Flex hor="auto" gap>
					<a
						v-for="item in menuList"
						@click="to(item.name)"
						:class="{
							active: item.isActive,
						}"
						>{{ item.label }}</a
					>
				</Flex>
			</Flex>
			<RouterView />
		</Flex>
	</ConfigProvider>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Router } from '@kotron/global';
import { ConfigProvider, Flex } from '@kotron/fortress-ui';

import pkg from '../package.json';

const route = useRoute();
const router = useRouter();

const menuList = computed(() => {
	const list = Router.getRouteMenu(route.name);
	list.shift();
	return list;
});

function to(name: string) {
	router.push({
		name,
	});
}
</script>

<style lang="scss" scoped>
.name {
	user-select: none;
	cursor: pointer;
	color: #fff;
	transition: all 0.2s linear;

	&:hover {
		color: #d3d35a;
		letter-spacing: 5px;
	}
}

.version {
	user-select: none;
	color: #666;
	font-size: rem(14px);
}

a {
	transition: color 0.2s linear;
	color: #666;
	cursor: pointer;
	user-select: none;

	&:hover,
	&.active {
		color: #d3d35a;
	}
}
</style>
