import * as Spanner from '@~crazy/spanner';

import { Instruct } from '../Instruct';
import {
	getDataRecord,
	getProxyDataSet,
	getProxyOptions,
	getTarget,
	isProxy,
} from '../Utils';
import { DataProxy } from '../DataProxy';
import { bubbleUpdateRecord } from '../DataProxy/update';
import { triggerWatch } from '../DataProxy/triggerWatch';

/**
 * 数组操作拦截
 * @param proxy 数组代理对象
 * @param nativeHandler 数组原生函数调用钩子
 * @param operateHandler 操作钩子函数
 * @returns 数组原始函数返回值
 */
export function arrayOperateIntercept<T extends any[]>(
	proxy: T,
	nativeHandler: (proxy: T) => any,
	operateHandler: (options: {
		proxy: T;
		oldValue: T;
		value: T;
		proxyOptions: DataProxy.Options<T>;
		proxyDataSet: DataProxy.DataSet<T>;
	}) => void
) {
	const oldValue = Spanner.clone(getDataRecord(proxy).value);
	proxy[Instruct.SymbolValue.$ARRAY_OPERATE_INTERCEPT] = true;
	const res = nativeHandler(proxy);
	proxy[Instruct.SymbolValue.$ARRAY_OPERATE_INTERCEPT] = false;
	const value = Spanner.clone(getTarget(proxy));
	const proxyOptions = getProxyOptions(proxy);
	const proxyDataSet = getProxyDataSet(proxy);
	operateHandler({
		proxy,
		oldValue,
		value,
		proxyOptions: <any>proxyOptions,
		proxyDataSet,
	});
	proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = {
		currentValue: value,
		oldValue,
		type: 'Update',
	} as Instruct['$SET_DATA_RECORD'];
	const record = getDataRecord(proxy);
	if (proxyOptions.superiorDataProxy) {
		bubbleUpdateRecord(
			proxyOptions.superiorDataProxy,
			<any>proxyDataSet.path,
			record
		);
		triggerWatch(
			proxyOptions.superiorDataProxy,
			<any>[...proxyDataSet.path],
			record
		);
	} else {
		bubbleUpdateRecord(proxy, [], record);
		triggerWatch(proxy, [], record);
	}
	return res;
}

const pop = Array.prototype.pop;
Array.prototype.pop = function <T>(): T {
	if (isProxy(this) && this.length) {
		return arrayOperateIntercept(
			this,
			(proxy) => pop.call(proxy),
			({ proxy, oldValue, proxyDataSet }) => {
				const key = `${oldValue.length - 1}`;
				if (proxyDataSet.childDataProxyMap.has(<any>key)) {
					proxyDataSet.childDataProxyMap.delete(<any>key);
				}
				getDataRecord(proxy, <any>key);
				proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
					key,
					{
						currentValue: null,
						oldValue: oldValue[key],
						type: 'Remove',
					},
				] as Instruct['$SET_DATA_RECORD'];
			}
		);
	} else {
		return pop.call(this);
	}
};

const push = Array.prototype.push;
Array.prototype.push = function <T>(...items: T[]): number {
	if (isProxy(this)) {
		return arrayOperateIntercept(
			this,
			(proxy) => push.call(proxy, ...items),
			({ proxy, oldValue, proxyDataSet }) => {
				const { length } = oldValue;
				items.forEach((item, index) => {
					const key = `${length + index}`;
					if (!(key in proxyDataSet.originValue)) {
						proxyDataSet.attrIsNewMap.set(<any>key, true);
					}
					proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
						key,
						{
							currentValue: item,
						},
					] as Instruct['$SET_DATA_RECORD'];
				});
			}
		);
	} else {
		return push.call(this, ...items);
	}
};

const reverse = Array.prototype.reverse;
Array.prototype.reverse = function <T>(): T[] {
	if (isProxy(this) && this.length) {
		return arrayOperateIntercept(
			this,
			(proxy) => reverse.call(proxy),
			({ proxy, oldValue, value, proxyDataSet }) => {
				let unchangedIndex: number;
				if (oldValue.length % 2) {
					unchangedIndex = Math.round(oldValue.length / 2) - 1;
				}
				oldValue.forEach((item, index) => {
					if (unchangedIndex !== index) {
						const key = `${index}`;
						if (proxyDataSet.childDataProxyMap.has(<any>key)) {
							proxyDataSet.childDataProxyMap.delete(<any>key);
						}
						proxy[key];
						getDataRecord(proxy, <any>key);
						proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
							key,
							{
								currentValue: value[index],
								oldValue: item,
								type: 'Update',
							},
						] as Instruct['$SET_DATA_RECORD'];
					}
				});
			}
		);
	} else {
		return reverse.call(this);
	}
};

const shift = Array.prototype.shift;
Array.prototype.shift = function <T>(): T | undefined {
	if (isProxy(this) && this.length) {
		return arrayOperateIntercept(
			this,
			(proxy) => shift.call(proxy),
			({ proxy, oldValue, value, proxyDataSet }) => {
				if (proxy.length > 1) {
					const maxIndex = oldValue.length - 1;
					oldValue.forEach((item, index) => {
						const key = `${index}`;
						getDataRecord(proxy, <any>key);
						if (index === maxIndex) {
							if (proxyDataSet.childDataProxyMap.has(<any>key)) {
								proxyDataSet.childDataProxyMap.delete(<any>key);
							}
							proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
								key,
								{
									currentValue: null,
									oldValue: item,
									type: 'Remove',
								},
							] as Instruct['$SET_DATA_RECORD'];
						} else {
							if (proxyDataSet.childDataProxyMap.has(<any>key)) {
								proxyDataSet.childDataProxyMap.delete(<any>key);
							}
							proxy[key];
							proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
								key,
								{
									currentValue: value[key],
									oldValue: item,
									type: 'Update',
								},
							] as Instruct['$SET_DATA_RECORD'];
						}
					});
				} else {
					const key = '0';
					if (proxyDataSet.childDataProxyMap.has(<any>key)) {
						proxyDataSet.childDataProxyMap.delete(<any>key);
					}
					getDataRecord(proxy, <any>key);
					proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
						key,
						{
							currentValue: null,
							oldValue: oldValue[key],
							type: 'Remove',
						},
					] as Instruct['$SET_DATA_RECORD'];
				}
			}
		);
	} else {
		return shift.call(this);
	}
};

const splice = Array.prototype.splice;
Array.prototype.splice = function <T>(
	start: number,
	deleteCount: number,
	...items: T[]
): T[] {
	if (isProxy(this)) {
		return arrayOperateIntercept(
			this,
			(proxy) => splice.call(proxy, start, deleteCount, ...items),
			({ proxy, oldValue, value, proxyDataSet }) => {
				const maxLength = Math.max(oldValue.length, value.length);
				const originMax = oldValue.length - 1;
				for (let i = 0; i < maxLength; i++) {
					if (i >= start) {
						const key = `${i}`;
						if (key in value) {
							if (proxyDataSet.childDataProxyMap.has(<any>key)) {
								proxyDataSet.childDataProxyMap.delete(<any>key);
							}
							proxy[key];
							if (i > originMax) {
								if (!(key in proxyDataSet.originValue)) {
									proxyDataSet.attrIsNewMap.set(
										<any>key,
										true
									);
								}
								proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
									key,
									{
										currentValue: value[key],
									},
								] as Instruct['$SET_DATA_RECORD'];
							} else {
								getDataRecord(proxy, <any>key);
								proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
									key,
									{
										currentValue: value[key],
										oldValue: oldValue[key],
									},
								] as Instruct['$SET_DATA_RECORD'];
							}
						} else {
							if (proxyDataSet.childDataProxyMap.has(<any>key)) {
								proxyDataSet.childDataProxyMap.delete(<any>key);
							}
							getDataRecord(proxy, <any>key);
							proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
								key,
								{
									currentValue: null,
									oldValue: oldValue[key],
									type: 'Remove',
								},
							] as Instruct['$SET_DATA_RECORD'];
						}
					}
				}
			}
		);
	} else {
		return splice.call(this, start, deleteCount, ...items);
	}
};

const unshift = Array.prototype.unshift;
Array.prototype.unshift = function <T>(...items: T[]): number {
	if (isProxy(this)) {
		return arrayOperateIntercept(
			this,
			(proxy) => unshift.call(proxy, ...items),
			({ proxy, oldValue, value, proxyDataSet }) => {
				const originIndex = value.length - oldValue.length + 1;
				value.forEach((item, index) => {
					const key = `${index}`;
					if (proxyDataSet.childDataProxyMap.has(<any>key)) {
						proxyDataSet.childDataProxyMap.delete(<any>key);
					}
					proxy[key];
					if (index > originIndex) {
						if (!(key in proxyDataSet.originValue)) {
							proxyDataSet.attrIsNewMap.set(<any>key, true);
						}
						proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
							key,
							{
								currentValue: value[key],
							},
						] as Instruct['$SET_DATA_RECORD'];
					} else {
						getDataRecord(proxy, <any>key);
						proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
							key,
							{
								currentValue: value[key],
								oldValue: oldValue[key],
								type: 'Update',
							},
						] as Instruct['$SET_DATA_RECORD'];
					}
				});
			}
		);
	} else {
		return unshift.call(this, ...items);
	}
};

/**
 * Array 原生函数
 */
export const ArrayNative = {
	pop,
	push,
	reverse,
	shift,
	splice,
	unshift,
};
