import * as Spanner from '@~crazy/spanner';

import { Instruct } from '../Instruct';
import {
	isProtected,
	isReadonly,
	isProtectAuth,
	getTarget,
	getDataRecord,
	isProxy,
	getProxyDataSet,
	getProxyOptions,
	isArrayOperateIntercept,
} from '../Utils';

import { DataProxy } from './index';
import { processingInstructions } from './processingInstructions';
import { bubbleUpdateRecord } from './update';
import { triggerWatch } from './triggerWatch';

/**
 * 构建数据代理
 * @param target 需要构建的目标，{} 或 []
 * @param options 选项
 * @returns
 */
export function buildDataProxy<
	S extends DataProxy.Type = DataProxy.Type,
	T extends DataProxy.Type = DataProxy.Type
>(target: T, options: Partial<DataProxy.Options<S>> = {}) {
	const isArray = Spanner.isArray(target);
	const isObject = Spanner.isObject(target);
	if (!isArray && !isObject) {
		console.warn(`The target type needs to be 'object' or 'array'`);
		return;
	}
	const proxyOptions = DataProxy.Options.getOptions<S>(options);
	const { superiorDataSet, key } = proxyOptions;
	let path = [];
	if (superiorDataSet) {
		path = [...superiorDataSet.path, key];
	}
	const originValue = Spanner.clone(target);
	const proxyDataSet = DataProxy.DataSet.getDataSet<T>({
		path,
		key: <any>key,
		originValue,
		isProtect: !!(superiorDataSet && superiorDataSet.isProtect),
		isReadonly: !!(superiorDataSet && superiorDataSet.isReadonly),
	});
	const dataProxy = new Proxy(target, {
		set(target, key, value) {
			if (Spanner.isSymbol(key)) {
				const instructions = processingInstructions(
					dataProxy,
					proxyOptions,
					proxyDataSet,
					target,
					<any>key,
					value
				);
				if (instructions) {
					instructions();
					return true;
				}
				Reflect.set(target, key, value);
			} else {
				if (isReadonly(dataProxy, <any>key)) {
					console.warn(`Assignment to readonly variable '${key}'`);
				} else if (
					isProtected(dataProxy, <any>key) &&
					!isProtectAuth(dataProxy)
				) {
					console.warn(`Assignment to protection variable '${key}'`);
				} else {
					const valueTarget = getTarget(value);
					const oldValue = Reflect.get(target, key);
					if (oldValue !== valueTarget) {
						if (isArrayOperateIntercept(dataProxy)) {
							Reflect.set(target, key, value);
						} else {
							if (proxyDataSet.childDataProxyMap.has(<any>key)) {
								proxyDataSet.childDataProxyMap.delete(<any>key);
							}
							if (isProxy(value)) {
								proxyDataSet.childDataProxyMap.set(
									<any>key,
									value
								);
								const options = getProxyOptions(value);
								options.key = <never>key;
								options.superiorDataProxy = dataProxy;
								options.superiorDataSet = <any>proxyDataSet;
								const dataSet = getProxyDataSet(value);
								dataSet.key = key;
								dataSet.path = [...proxyDataSet.path, key];
								if (dataSet.selfDataRecord) {
									const record = Spanner.merge(
										true,
										dataSet.selfDataRecord,
										<any>{
											key,
											path: [...dataSet.path],
										}
									);
									proxyDataSet.attrDataRecordMap.set(
										<any>key,
										record
									);
									dataSet.selfDataRecord = null;
								}
								if (dataSet.selfWatchMap) {
									if (
										!proxyDataSet.attrMappingWatchMap.has(
											key
										)
									) {
										proxyDataSet.attrMappingWatchMap.set(
											key,
											[]
										);
									}
									const watchlist =
										proxyDataSet.attrMappingWatchMap.get(
											key
										);
									dataSet.selfWatchMap.forEach((opts, id) => {
										const newOpts: Omit<
											DataProxy.WatchOptions,
											'immediate'
										> = {
											key,
											...opts,
										};
										proxyDataSet.attrWatchMap.set(
											id,
											newOpts
										);
										watchlist.push(id);
									});
									proxyDataSet.attrMappingWatchMap.set(
										key,
										watchlist
									);
									dataSet.selfWatchMap = null;
								}
							}
							const isNew = !(key in proxyDataSet.originValue);
							if (isNew) {
								proxyDataSet.attrIsNewMap.set(<any>key, true);
								dataProxy[
									Instruct.SymbolValue.$SET_DATA_RECORD
								] = [
									<any>key,
									{
										currentValue: valueTarget,
									},
								] as [keyof T, Instruct.SetDataRecordParams<T>];
							} else {
								getDataRecord(dataProxy, <any>key);
								dataProxy[
									Instruct.SymbolValue.$SET_DATA_RECORD
								] = [
									<any>key,
									{
										currentValue: valueTarget,
										oldValue,
										type: 'Update',
									},
								] as [keyof T, Instruct.SetDataRecordParams<T>];
							}
							Reflect.set(target, key, value);
							const record = proxyDataSet.attrDataRecordMap.get(
								<any>key
							);
							if (proxyOptions.superiorDataProxy) {
								bubbleUpdateRecord(
									proxyOptions.superiorDataProxy,
									<any>proxyDataSet.path,
									record
								);
							} else {
								bubbleUpdateRecord(dataProxy, [], record);
							}
							triggerWatch(
								dataProxy,
								<any>[...proxyDataSet.path, key],
								record
							);
						}
					}
				}
			}
			return true;
		},
		get(target, key) {
			if (Spanner.isSymbol(key)) {
				const instructions = processingInstructions(
					dataProxy,
					proxyOptions,
					proxyDataSet,
					target,
					<any>key
				);
				if (instructions) {
					return instructions();
				}
			}
			const value = Reflect.get(target, key);
			if (Spanner.isObject(value) || Spanner.isArray(value)) {
				if (proxyDataSet.childDataProxyMap.has(<any>key)) {
					return proxyDataSet.childDataProxyMap.get(<any>key);
				} else {
					const childDataProxy = buildDataProxy(<any>value, {
						superiorDataProxy: dataProxy,
						superiorDataSet: proxyDataSet,
						key: <any>key,
					});
					proxyDataSet.childDataProxyMap.set(
						<any>key,
						childDataProxy
					);
					return childDataProxy;
				}
			}
			return value;
		},
		deleteProperty(target, key) {
			if (isReadonly(dataProxy, <any>key)) {
				console.warn(`Assignment to readonly variable '${<any>key}'`);
			} else if (isProtected(dataProxy, <any>key)) {
				console.warn(`Assignment to protection variable '${<any>key}'`);
			} else if (key in target) {
				if (isArrayOperateIntercept(dataProxy)) {
					Reflect.deleteProperty(target, key);
				} else {
					console.log('deleteProperty', key);
					if (proxyDataSet.childDataProxyMap.has(<any>key)) {
						proxyDataSet.childDataProxyMap.delete(<any>key);
					}
					getDataRecord(dataProxy, <any>key);
					dataProxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
						key,
						{
							currentValue: null,
							type: 'Remove',
						},
					] as [keyof T, Instruct.SetDataRecordParams<T>];
					Reflect.deleteProperty(target, key);
					const record = proxyDataSet.attrDataRecordMap.get(<any>key);
					if (proxyOptions.superiorDataProxy) {
						bubbleUpdateRecord(
							proxyOptions.superiorDataProxy,
							<any>proxyDataSet.path,
							record
						);
					} else {
						bubbleUpdateRecord(dataProxy, [], record);
					}
					triggerWatch(
						dataProxy,
						[...proxyDataSet.path, key] as any,
						record
					);
				}
			}
			return true;
		},
	});
	return dataProxy;
}
