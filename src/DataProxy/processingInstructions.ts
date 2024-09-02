import * as Spanner from '@~crazy/spanner';

import { Instruct } from '../Instruct';
import { isProtectAuth, getDataRecord, getOriginValue } from '../Utils';

import { DataProxy } from './index';
import { triggerWatchByOptions } from './triggerWatch';

export type ProcessingInstructionsReturnHook<T> = () => T;

/**
 * 处理系统指令
 * @param proxy 代理对象
 * @param proxyOptions 代理选项
 * @param proxyDataSet 代理数据集
 * @param target 原始对象
 * @param type 指令类型
 * @param value 指令值
 * @returns 获取返回值的钩子函数
 */
export function processingInstructions<
	R,
	T extends DataProxy.Type = DataProxy.Type,
	U extends DataProxy.Type = DataProxy.Type,
	I extends Instruct = Instruct,
	IK extends keyof I = keyof I
>(
	proxy: T,
	proxyOptions: DataProxy.Options<U>,
	proxyDataSet: DataProxy.DataSet<T>,
	target: T,
	type: IK,
	value?: I[IK]
): ProcessingInstructionsReturnHook<R> {
	switch (type) {
		case Instruct.SymbolValue.$IS_PROXY:
			return () => <any>true;
		case Instruct.SymbolValue.$IS_PROTECT:
			return <any>(() => {
				if (value) {
					return (<Instruct['$IS_PROTECT']>value)((attr) =>
						proxyDataSet.attrProtectMap.has(<any>attr)
					);
				} else {
					if (proxyDataSet.isProtect) {
						return true;
					} else if (proxyOptions.superiorDataSet) {
						return proxyOptions.superiorDataSet.isProtect;
					} else {
						return false;
					}
				}
			});
		case Instruct.SymbolValue.$IS_READONLY:
			return <any>(() => {
				if (value) {
					return (<Instruct['$IS_READONLY']>value)((attr) =>
						proxyDataSet.attrReadonlyMap.has(<any>attr)
					);
				} else {
					if (proxyDataSet.isReadonly) {
						return true;
					} else if (proxyOptions.superiorDataSet) {
						return proxyOptions.superiorDataSet.isReadonly;
					} else {
						return false;
					}
				}
			});
		case Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH:
			return <any>(() => {
				if (value) {
					proxyDataSet.isProtectAuth =
						value as Instruct['$PROXY_PROTECT_SETTER_AUTH'];
				} else {
					if (proxyDataSet.isProtectAuth) {
						return true;
					} else if (proxyOptions.superiorDataProxy) {
						return isProtectAuth(proxyOptions.superiorDataProxy);
					} else {
						return false;
					}
				}
			});
		case Instruct.SymbolValue.$ADD_PROXY_WATCH:
			return <any>(() => {
				const [id, { key, handler, immediate, deep }] =
					value as Instruct['$ADD_PROXY_WATCH'];
				if (key) {
					const options: Omit<
						DataProxy.WatchOptions<T>,
						'immediate'
					> = {
						key,
						handler,
						deep,
					};
					proxyDataSet.attrWatchMap.set(id, options);
					(Spanner.isArray(key) ? key : [key]).forEach((k) => {
						if (!proxyDataSet.attrMappingWatchMap.has(k)) {
							proxyDataSet.attrMappingWatchMap.set(k, []);
						}
						const watchlist =
							proxyDataSet.attrMappingWatchMap.get(k);
						watchlist.push(id);
						proxyDataSet.attrMappingWatchMap.set(k, watchlist);
					});
					if (immediate) {
						triggerWatchByOptions(proxy, options);
					}
				} else {
					if (proxyOptions.superiorDataProxy) {
						proxyOptions.superiorDataProxy[
							Instruct.SymbolValue.$ADD_PROXY_WATCH
						] = [
							id,
							{
								key: proxyDataSet.key,
								handler,
								immediate,
								deep,
							},
						];
					} else {
						if (!proxyDataSet.selfWatchMap) {
							proxyDataSet.selfWatchMap = new Map();
						}
						const options: Omit<
							DataProxy.WatchOptions<T>,
							'key' | 'immediate'
						> = {
							handler,
							deep,
						};
						proxyDataSet.selfWatchMap.set(id, options);
						if (immediate) {
							triggerWatchByOptions(proxy, options);
						}
					}
				}
			});
		case Instruct.SymbolValue.$REMOVE_PROXY_WATCH:
			return <any>(() => {
				const id = <string>value;
				proxyDataSet.attrWatchMap.delete(id);
				if (proxyOptions.superiorDataProxy) {
					proxyOptions.superiorDataProxy[
						Instruct.SymbolValue.$REMOVE_PROXY_WATCH
					] = id;
				} else {
					if (proxyDataSet.selfWatchMap) {
						proxyDataSet.selfWatchMap.delete(id);
					}
				}
			});
		case Instruct.SymbolValue.$ARRAY_OPERATE_INTERCEPT:
			return <any>(() => {
				if (value === undefined) {
					return proxyDataSet.arrayOperateIntercept;
				} else {
					proxyDataSet.arrayOperateIntercept = <
						Instruct['$ARRAY_OPERATE_INTERCEPT']
					>value;
				}
			});
		case Instruct.SymbolValue.$GET_TARGET:
			return () => <any>target;
		case Instruct.SymbolValue.$GET_SUPERIOR_PROXY:
			return () => <any>proxyOptions.superiorDataProxy;
		case Instruct.SymbolValue.$GET_PROXY_OPTIONS:
			return () => <any>proxyOptions;
		case Instruct.SymbolValue.$GET_PROXY_DATASET:
			return () => <any>proxyDataSet;
		case Instruct.SymbolValue.$GET_PROXY_PATH:
			return <any>(() => {
				if (value) {
					let res: Array<keyof T>;
					(<Instruct.GetterAttrPath<T>>value)((attr) => {
						if (attr in target) {
							res = [...proxyDataSet.path, attr];
						}
						return res;
					});
					return res;
				} else {
					return [...proxyDataSet.path];
				}
			});
		case Instruct.SymbolValue.$GET_ORIGIN_VALUE:
			return <any>(() => {
				if (value) {
					let res: T[keyof T];
					(<Instruct.GetterAttrOriginValue<T>>value)((attr) => {
						if (attr in target) {
							res = proxyDataSet.originValue[attr];
						}
						return res;
					});
					return res;
				} else {
					return proxyDataSet.originValue;
				}
			});
		case Instruct.SymbolValue.$GET_DATA_RECORD:
			return <any>(() => {
				if (value) {
					let record: DataProxy.DataRecord<T[keyof T]>;
					(<Instruct.GetterDataRecord<T>>value)((attr) => {
						if (
							attr in proxy ||
							attr in getOriginValue(proxy) ||
							getOriginValue(proxy, attr) ||
							proxyDataSet.attrDataRecordMap.has(attr)
						) {
							if (!proxyDataSet.attrDataRecordMap.has(attr)) {
								proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = [
									attr,
									{
										currentValue:
											proxyDataSet.originValue[attr],
										oldValue: null,
									},
								] as [keyof T, Instruct.SetDataRecordParams<T>];
							}
							record = Spanner.clone(
								proxyDataSet.attrDataRecordMap.get(attr)
							);
							Object.freeze(record);
							return record;
						}
					});
					return record;
				} else {
					if (proxyOptions.superiorDataProxy) {
						return getDataRecord(
							proxyOptions.superiorDataProxy,
							<any>proxyDataSet.key
						);
					} else {
						if (!proxyDataSet.selfDataRecord) {
							proxy[Instruct.SymbolValue.$SET_DATA_RECORD] = {
								currentValue: proxyDataSet.originValue,
								oldValue: null,
							} as Instruct.SetDataRecordParams<T>;
						}
						const record = Spanner.clone(
							proxyDataSet.selfDataRecord
						);
						Object.freeze(record);
						return record;
					}
				}
			});
		case Instruct.SymbolValue.$SET_DATA_RECORD:
			return <any>(() => {
				if (Spanner.isArray(value)) {
					const [key, { currentValue, oldValue, type, bubble }] =
						value as [
							keyof T,
							Instruct.SetDataRecordParams<T[keyof T]>
						];
					let record: DataProxy.DataRecord<T[keyof T]>;
					if (proxyDataSet.attrDataRecordMap.has(key)) {
						record = proxyDataSet.attrDataRecordMap.get(key);
						record.type = 'Update';
					} else {
						const isNew = proxyDataSet.attrIsNewMap.has(key);
						record = DataProxy.DataRecord.getDataRecord<
							(typeof record)['value']
						>({
							path: [...proxyDataSet.path, key],
							key,
							isNew,
							originValue: isNew
								? Spanner.clone(currentValue)
								: proxyDataSet.originValue[key],
						});
					}
					if (bubble) {
						record.bubble = bubble;
						record.type = 'Update';
					} else {
						if (type) {
							record.type = type;
						}
					}
					if (record.type !== 'Add') {
						record.hasChange = true;
					}
					record.oldValue = Spanner.clone(oldValue || record.value);
					record.value = Spanner.clone(currentValue);
					proxyDataSet.attrDataRecordMap.set(key, record);
				} else {
					if (proxyOptions.superiorDataProxy) {
						proxyOptions.superiorDataProxy[
							Instruct.SymbolValue.$SET_DATA_RECORD
						] = [proxyDataSet.key, value];
					} else {
						const { currentValue, oldValue, type, bubble } =
							value as Instruct.SetDataRecordParams<T>;
						let record: DataProxy.DataRecord<T>;
						if (proxyDataSet.selfDataRecord) {
							record = proxyDataSet.selfDataRecord;
						} else {
							record = DataProxy.DataRecord.getDataRecord<T>({
								originValue: proxyDataSet.originValue,
							});
						}
						if (bubble) {
							record.bubble = bubble;
							record.type = 'Update';
						} else {
							if (type) {
								record.type = type;
							}
						}
						if (record.type !== 'Add') {
							record.hasChange = true;
						}
						record.oldValue = Spanner.clone(
							oldValue || record.value
						);
						record.value = Spanner.clone(currentValue);
						proxyDataSet.selfDataRecord = record;
					}
				}
			});
		case Instruct.SymbolValue.$SET_PROXY_PROTECT:
			return <any>(() => {
				if (value) {
					proxyDataSet.attrProtectMap.set(
						<Instruct['$SET_PROXY_PROTECT']>value,
						true
					);
				} else {
					proxyDataSet.isProtect = true;
				}
			});
		case Instruct.SymbolValue.$SET_PROXY_READONLY:
			return <any>(() => {
				if (value) {
					proxyDataSet.attrReadonlyMap.set(
						<Instruct['$SET_PROXY_READONLY']>value,
						true
					);
				} else {
					proxyDataSet.isReadonly = true;
				}
			});
		default:
			return;
	}
}
