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

const studentList = DataProxy<
	Array<{
		name: string;
		age: number;
	}>
>([
	{
		name: '小明',
		age: 15,
	},
	{
		name: '小红',
		age: 16,
	},
	{
		name: '张三',
		age: 15,
	},
	{
		name: '李四',
		age: 15,
	},
]);

getDataRecord(studentList);

watchProxy(
	studentList,
	(record) => {
		console.log(record);
	},
	{
		deep: true,
	}
);

addWatch(studentList, 0, (record) => {
	console.log(record);
});

addWatch(studentList, 1, (record) => {
	console.log(record);
});

const data = DataProxy<{
	studentList: typeof studentList;
}>({
	studentList: null,
});

data.studentList = studentList;

addWatch(
	data,
	'studentList',
	(record) => {
		console.log('studentList', record);
	},
	{
		deep: true,
	}
);

studentList.shift();
// studentList.push({
// 	name: '王五',
// 	age: 18,
// });
</script>

<style lang="scss" scoped></style>
