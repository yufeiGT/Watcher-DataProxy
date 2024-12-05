import * as Spanner from '@~crazy/spanner';

import { getDataRecord, getProxyDataSet, getSuperiorProxy } from '../Utils';

import { DataProxy } from './index';

/**
 * 根据选项触发观察
 * @param proxy  代理对象
 * @param options  观察选项
 * @param isDeep 是否深观察
 * @param bubble 原始触发观察的冒泡记录，可选
 */
export function triggerWatchByOptions<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(
	proxy: DataProxy<T>,
	options:
		| Omit<DataProxy.WatchOptions<T>, 'immediate'>
		| Omit<DataProxy.WatchOptions<T>, 'key' | 'immediate'>,
	isDeep = false,
	bubble?: DataProxy.DataRecord
) {
	const { key, handler, deep } = options as Omit<
		DataProxy.WatchOptions<T>,
		'immediate'
	>;
	if (!(isDeep && !deep)) {
		if (key) {
			if (Spanner.isArray(key)) {
				const records: DataProxy.DataRecord<T[K]>[] = [];
				key.forEach((item) => {
					records.push(getDataRecord(proxy, <any>item));
				});
				(<DataProxy.WatchOptions.MultipleWatchHandler<T[K]>>handler)(
					records,
					bubble || null
				);
			} else {
				(<DataProxy.WatchOptions.WatchHandler<T[K]>>handler)(
					getDataRecord(proxy, <any>key)
				);
			}
		} else {
			(<DataProxy.WatchOptions.WatchHandler<T>>handler)(
				getDataRecord(proxy)
			);
		}
	}
}

/**
 * 触发观察
 * @param proxy 代理对象
 * @param path 触发的数据路径
 * @param record 原始触发观察的记录，可选
 */
export function triggerWatch<T extends DataProxy.Type = DataProxy.Type>(
	proxy: DataProxy<T>,
	path: string[],
	record?: DataProxy.DataRecord
) {
	const dataPath = [...path];
	let target = proxy;
	let needDeep = false;
	while (target) {
		const { length } = dataPath;
		if (length) {
			const key = dataPath[length - 1];
			const dataSet = getProxyDataSet(target);
			if (dataSet.attrMappingWatchMap.has(key)) {
				dataSet.attrMappingWatchMap.get(key).forEach((id) => {
					if (dataSet.attrWatchMap.has(id)) {
						triggerWatchByOptions(
							target,
							dataSet.attrWatchMap.get(id),
							needDeep,
							record
						);
					} else {
						dataSet.attrWatchMap.delete(id);
					}
				});
			}
		}
		needDeep = true;
		const superior = getSuperiorProxy<T>(target);
		if (!superior) {
			const dataSet = getProxyDataSet(target);
			if (dataSet.selfWatchMap) {
				dataSet.selfWatchMap.forEach((options) => {
					triggerWatchByOptions(target, options, needDeep, record);
				});
			}
		}
		target = superior;
		dataPath.pop();
	}
}
