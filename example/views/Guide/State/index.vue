<template></template>

<script lang="ts" setup>
import {
	DataProxy,
	ProxyState,
	addWatch,
	getDataRecord,
} from '@kotron/watcher';

console.clear();

interface Author {
	name: string;
	email: string;
}

interface Options {
	name: string;
	version: string;
	tags: string[];
	author: Author;
}

const options: Options = {
	name: '演示项目',
	version: '0.1.0',
	tags: ['0.0.1', '0.0.5', '0.1.0'],
	author: {
		name: 'GT',
		email: '769416198@qq.com',
	},
};

const data = DataProxy.use<Options>(options);

addWatch(
	data,
	'author',
	(record) => {
		console.log(record);
	},
	{
		deep: true,
	}
);

const authorState = ProxyState.use(data.author);

authorState.shadow.name = 'sd';

ProxyState.push(authorState);

console.log(authorState);

console.log(getDataRecord(data.author, 'email'));

ProxyState.on(authorState, 'update', (value, oldValue) => {});

function f() {
	console.log('f(): evaluated');
	return function (
		target,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		console.log('f(): called', target, propertyKey, descriptor);
	};
}

function g() {
	console.log('g(): evaluated');
	return function (
		target,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		console.log('g(): called', target, propertyKey, descriptor);
	};
}

class C {
	@f()
	@g()
	method() {}
}

new C().method();
</script>

<style lang="scss" scoped></style>
