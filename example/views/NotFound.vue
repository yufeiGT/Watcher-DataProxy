<template>
	<Flex vert="auto" gap :pad="100" align-cross="center">
		<p>404 Not Found</p>
		<RouterLink to="/home">返回首页</RouterLink>
	</Flex>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Flex, CssUnits } from '@kotron/fortress-ui';

const fontSize = ref(CssUnits.rem(30));
</script>

<style lang="scss" scoped>
p {
	font-size: v-bind(fontSize);
}

a {
	color: currentColor;
}
</style>
