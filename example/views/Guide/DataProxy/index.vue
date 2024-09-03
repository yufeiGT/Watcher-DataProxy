<template>
	<ConfigProvider :border-radius="4">
		<Flex vert="auto" gap apd></Flex>
	</ConfigProvider>
</template>

<script lang="ts" setup>
import { ConfigProvider, Flex } from '@kotron/fortress-ui';
import {
	Instruct,
	DataProxy,
	isProxy,
	isProtected,
	isReadonly,
	isProtectAuth,
	isArrayOperateIntercept,
	protect,
	readonly,
	watchProxy,
	addWatch,
	getTarget,
	getSuperiorProxy,
	getProxyOptions,
	getProxyDataSet,
	getProxyPath,
	getOriginValue,
	getDataRecord,
} from '@kotron/watcher';

import MdPreviewVue from '@/components/MdPreview.vue';

console.clear();

const options = {
	name: '演示项目',
	version: '0.1.0',
	tags: ['0.0.1', '0.0.5', '0.1.0'],
	author: {
		name: 'GT',
		email: '769416198@qq.com',
	},
};

// 创建数据代理
const data = DataProxy(options);

console.log(data);

// 观察代理对象
watchProxy(
	data,
	(record) => {
		console.log('watchProxy', record);
	},
	{
		// 顶层代理对象需要添加深观察才能生效
		deep: true,
	}
);

// 观察属性
addWatch(
	data,
	'name',
	(record) => {
		console.log('name', record);
	},
	{
		// 立即触发
		immediate: true,
	}
);

// 深观察tags数组
addWatch(
	data,
	'tags',
	(record) => {
		console.log('tags', record);
	},
	{
		// 深观察
		deep: true,
	}
);

/**
 * 监听多个属性
 * removeWatch为可移除观察的函数
 */
const removeWatch = addWatch(
	data,
	['version', 'author'],
	(records, trigger) => {
		console.log('version & author', records, trigger);
	}
);

data.name = '演示项目2';

data.tags.push('0.1.1');

data.version = '0.1.1';

removeWatch();

console.log(getTarget(data));
console.log(getOriginValue(data.tags));
console.log(getDataRecord(data, 'name'));

const setter = protect(data.author);
data.author.name = 'GTX';
setter((target) => {
	target.name = 'GTX';
});

readonly(data, 'name');
data.name = '演示项目';

console.log(isProxy(data.tags));
console.log(isProtected(data.author, 'name'));
console.log(isReadonly(data, 'name'));
</script>

<style lang="scss" scoped></style>
