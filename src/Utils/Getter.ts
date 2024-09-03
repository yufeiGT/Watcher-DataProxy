import { Instruct } from '../Instruct';
import { DataProxy } from '../DataProxy';

import { isNotDataProxy } from './NotDataProxy';
import { isProxy } from './Determine';

/**
 * 获取代理对象原始目标数据
 * @param proxy 代理对象
 * @returns
 */
export function getTarget<T>(proxy: T): T {
	if (isProxy(proxy)) {
		return proxy[Instruct.SymbolValue.$GET_TARGET];
	} else {
		return proxy;
	}
}

/**
 * 获取上级代理对象
 * @param proxy 代理对象
 * @returns
 */
export function getSuperiorProxy<
	T extends DataProxy.Type,
	U extends DataProxy.Type = DataProxy.Type
>(proxy: U): T {
	if (isProxy(proxy)) {
		return proxy[Instruct.SymbolValue.$GET_SUPERIOR_PROXY];
	} else {
		isNotDataProxy();
	}
}

/**
 * 获取代理选项
 * @param proxy 代理对象
 * @returns
 */
export function getProxyOptions<
	S extends DataProxy.Type,
	T extends DataProxy.Type
>(proxy: T): DataProxy.Options<S> {
	if (isProxy(proxy)) {
		return proxy[Instruct.SymbolValue.$GET_PROXY_OPTIONS];
	} else {
		isNotDataProxy();
	}
}

/**
 * 获取代理数据集
 * @param proxy 代理对象
 * @returns
 */
export function getProxyDataSet<T extends DataProxy.Type>(
	proxy: T
): DataProxy.DataSet<T> {
	if (isProxy(proxy)) {
		return proxy[Instruct.SymbolValue.$GET_PROXY_DATASET];
	} else {
		isNotDataProxy();
	}
}

/**
 * 获取代理对象数据路径
 * @param proxy 代理对象
 * @returns
 */
export function getProxyPath<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T): K[];
/**
 * 获取代理对象下属性的数据路径
 * @param proxy 代理对象
 * @param key 代理对象下的属性
 */
export function getProxyPath<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T, key: K): K[];
export function getProxyPath<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(...params): K[] {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (params.length > 1) {
			let res: K[];
			proxy[Instruct.SymbolValue.$GET_PROXY_PATH] = (resolve) => {
				res = resolve(key);
			};
			return res;
		} else {
			return proxy[Instruct.SymbolValue.$GET_PROXY_PATH];
		}
	} else {
		isNotDataProxy();
	}
}

/**
 * 获取代理对象初始值
 * @param proxy 代理对象
 * @returns
 */
export function getOriginValue<T extends DataProxy.Type>(proxy: T): T;
/**
 * 获取代理对象下属性的初始值
 * @param proxy 代理对象
 * @param key 代理对象下的属性
 * @returnss
 */
export function getOriginValue<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T, key: K): T[K];
export function getOriginValue<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(...params) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (params.length > 1) {
			let res: T[K];
			proxy[Instruct.SymbolValue.$GET_ORIGIN_VALUE] = (resolve) => {
				res = resolve(key);
			};
			return res;
		} else {
			return proxy[Instruct.SymbolValue.$GET_ORIGIN_VALUE];
		}
	} else {
		isNotDataProxy();
	}
}

/**
 * 获取代理对象的数据记录
 * @param proxy 代理对象
 */
export function getDataRecord<T extends DataProxy.Type>(
	proxy: T
): DataProxy.DataRecord<T>;
/**
 * 获取代理对象下属性的数据记录
 * @param proxy 代理对象
 * @param key 代理对象下的数据记录
 */
export function getDataRecord<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T, key: K): DataProxy.DataRecord<T[K]>;
export function getDataRecord<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(...params) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (params.length > 1) {
			let res: DataProxy.DataRecord<T[K]>;
			proxy[Instruct.SymbolValue.$GET_DATA_RECORD] = <
				Instruct['$GET_DATA_RECORD']
			>((resolve) => {
				res = resolve(<never>`${<any>key}`);
			});
			return res;
		} else {
			return proxy[Instruct.SymbolValue.$GET_DATA_RECORD];
		}
	} else {
		isNotDataProxy();
	}
}
