<template>
	<Flex hor>
		<Flex
			class="left-menu"
			vert="auto"
			:auto="250"
			gap
			pad
			style="border-right: solid 1px #666"
		>
			<a
				v-for="item in menuList"
				@click="to(item.name)"
				:class="{
					active: item.isActive,
				}"
				>{{ item.label }}</a
			>
		</Flex>
		<RouterView />
	</Flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Router } from '@kotron/global';
import { Flex } from '@kotron/fortress-ui';

const route = useRoute();
const router = useRouter();

const menuList = computed(() => {
	const [home, guide] = Router.getRouteMenu(route.name);
	if (guide) {
		return guide.children;
	} else {
		return [];
	}
});

function to(name: string) {
	router.push({
		name,
	});
}
</script>

<style lang="scss" scoped>
.left-menu {
	a {
		transition: color 0.2s linear;
		color: #666;
		cursor: pointer;
		user-select: none;
		font-size: rem(14px);

		&:hover,
		&.active {
			color: #ff0;
		}
	}
}
</style>
