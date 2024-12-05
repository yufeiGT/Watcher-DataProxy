import * as Spanner from '@~crazy/spanner';

import { Instruct } from '../Instruct';
import { DataProxy } from '../DataProxy';
import { getDataRecord, getSuperiorProxy, getTarget, isProxy } from '../Utils';

/**
 * 更新数据记录
 * @param proxy 代理对象
 * @param path 更新的属性路径
 * @param bubble 触发冒泡的记录
 */
export function updateDataRecord<T extends DataProxy.Type>(
	proxy: DataProxy<T>,
	path: string[],
	bubble: DataProxy.DataRecord
) {
	const record = getDataRecord(proxy);
	const currentValue = Spanner.clone(getTarget(proxy));
	const oldValue = Spanner.isObject(currentValue)
		? Spanner.merge(true, currentValue, record.value || record.originValue)
		: record.oldValue || record.originValue;
	let target = proxy;
	let currentSetter = currentValue;
	let oldSetter = oldValue;
	path.forEach((key) => {
		target = target[key];
		if (isProxy(target)) {
			currentSetter = currentSetter[key];
			oldSetter = oldSetter[key];
		}
	});
	currentSetter[bubble.key] = Spanner.clone(bubble.value);
	if (Spanner.isArray(currentSetter)) {
		if (bubble.key in oldSetter) {
			oldSetter[bubble.key] = Spanner.clone(bubble.oldValue);
		}
	} else {
		oldSetter[bubble.key] = Spanner.clone(bubble.oldValue);
	}
	if (JSON.stringify(bubble.path) !== JSON.stringify(record.path)) {
		proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = {
			currentValue,
			oldValue,
			type: 'Update',
			bubble,
		} as Instruct.SetDataRecordParams<T>;
	}
}

/**
 * 冒泡更新记录
 * @param proxy 发生变化的代理对象
 * @param path 数据路径
 * @param bubble 发生变化的记录
 */
export function bubbleUpdateRecord<T extends DataProxy.Type>(
	proxy: DataProxy<T>,
	path: string[],
	record: DataProxy.DataRecord
) {
	const dataPath = [...path];
	let target = proxy;
	while (target) {
		const { length } = dataPath;
		if (length) {
			const key = dataPath[length - 1];
			target[Instruct.SymbolValue.$GET_DATA_RECORD] = (resolve) =>
				resolve(<any>key) as Instruct.GetterDataRecord<T>;
			updateDataRecord(
				target[key],
				[...record.path].splice(length, record.path.length - 1),
				record
			);
		}
		const superior = getSuperiorProxy<T>(target);
		if (!superior) {
			target[Instruct.SymbolValue.$GET_DATA_RECORD];
			updateDataRecord(target, path, record);
		}
		target = superior;
		dataPath.pop();
	}
}
