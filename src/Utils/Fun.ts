import * as Spanner from '@~crazy/spanner';

import { Instruct } from '../Instruct';
import { DataProxy } from '../DataProxy';

import { isNotDataProxy } from './NotDataProxy';
import { isProxy } from './Determine';
import { getSuperiorProxy, getProxyPath } from './Getter';

/**
 * 保护代理对象
 * @param proxy 需要保护的代理对象
 * @returns 可以对保护对象进行赋值的函数
 */
export function protect<T extends DataProxy.Type>(
	proxy: T
): (setter: T | ((target: T) => void)) => void;
/**
 * 保护代理对象下的属性
 * @param proxy 代理对象
 * @param key 需要保护的属性
 * @returns 可以对属性进行赋值的函数
 */
export function protect<T extends DataProxy.Type, K extends keyof T = keyof T>(
	proxy: T,
	key: K
): (value: T[K]) => void;
export function protect<T extends DataProxy.Type, K extends keyof T = keyof T>(
	...params
) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (params.length > 1) {
			proxy[Instruct.SymbolValue.$SET_PROXY_PROTECT] = key;
			return (value: T[K]) => {
				proxy[Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH] = true;
				proxy[key] = value;
				proxy[Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH] = false;
			};
		} else {
			const superior = getSuperiorProxy(proxy);
			if (superior) {
				const path = getProxyPath(proxy);
				protect(superior, <never>path[path.length - 1]);
			}
			proxy[Instruct.SymbolValue.$SET_PROXY_PROTECT];
			return (setter: (target: T) => void) => {
				proxy[Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH] = true;
				setter(proxy);
				proxy[Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH] = false;
			};
		}
	} else {
		isNotDataProxy();
	}
}

/**
 * 设置代理对象为只读
 * @param proxy 需要设置代理对象
 */
export function readonly<T extends DataProxy.Type>(proxy: T): void;
/**
 * 设置代理对象下的属性为只读
 * @param proxy 代理对象
 * @param key 需要设置的属性
 */
export function readonly<T extends DataProxy.Type, K extends keyof T = keyof T>(
	proxy: T,
	key: K
): void;
export function readonly<T extends DataProxy.Type, K extends keyof T = keyof T>(
	...params
) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (params.length > 1) {
			proxy[Instruct.SymbolValue.$SET_PROXY_READONLY] = key;
		} else {
			const superior = getSuperiorProxy(proxy);
			if (superior) {
				const path = getProxyPath(proxy);
				readonly(superior, <never>path[path.length - 1]);
			}
			proxy[Instruct.SymbolValue.$SET_PROXY_READONLY];
		}
	} else {
		isNotDataProxy();
	}
}

/**
 * 为代理对象添加观察
 * @param proxy 代理对象
 * @param handler 回调函数
 * @param options 观察选项，可选
 * @returns 可移除观察的函数
 */
export function watchProxy<T extends DataProxy.Type>(
	proxy: T,
	handler: DataProxy.WatchOptions.WatchHandler<T>,
	options: Partial<Omit<DataProxy.WatchOptions, 'key' | 'handler'>> = {}
) {
	if (isProxy(proxy)) {
		const id = Spanner.createID();
		const opts = Spanner.merge(
			{
				immediate: false,
				deep: false,
			},
			options
		);
		proxy[Instruct.SymbolValue.$ADD_PROXY_WATCH] = [
			id,
			{
				handler,
				...opts,
			} as Omit<DataProxy.WatchOptions<T>, 'key'>,
		];
		return () => (proxy[Instruct.SymbolValue.$REMOVE_PROXY_WATCH] = id);
	} else {
		isNotDataProxy();
	}
}

/**
 * 为代理对象下的属性添加观察
 * @param proxy 代理对象
 * @param key 需要观察的属性
 * @param handler 回调函数
 * @param options 观察选项，可选
 * @returns 可移除观察的函数
 */
export function addWatch<T extends DataProxy.Type, K extends keyof T = keyof T>(
	proxy: T,
	key: K,
	handler: DataProxy.WatchOptions.WatchHandler<T>,
	options?: Partial<Omit<DataProxy.WatchOptions, 'key' | 'handler'>>
): () => void;
/**
 * 为代理对象下的属性添加观察
 * @param proxy 代理对象
 * @param keys 需要观察的多个属性
 * @param handler 回调函数
 * @param options 观察选项，可选
 * @returns 可移除观察的函数
 */
export function addWatch<T extends DataProxy.Type, K extends keyof T = keyof T>(
	proxy: T,
	keys: K[],
	handler: DataProxy.WatchOptions.MultipleWatchHandler<T>,
	options?: Partial<Omit<DataProxy.WatchOptions, 'key' | 'handler'>>
): () => void;
export function addWatch<T extends DataProxy.Type, K extends keyof T = keyof T>(
	proxy: T,
	key: K | K[],
	handler: DataProxy.WatchOptions['handler'],
	options: Partial<Omit<DataProxy.WatchOptions, 'key' | 'handler'>> = {}
) {
	if (isProxy(proxy)) {
		const id = Spanner.createID();
		const opts = Spanner.merge(
			{
				immediate: false,
				deep: false,
			},
			options
		);
		proxy[Instruct.SymbolValue.$ADD_PROXY_WATCH] = [
			id,
			{
				key: `${<any>key}`,
				handler,
				...opts,
			} as DataProxy.WatchOptions<T[K]>,
		];
		return () => (proxy[Instruct.SymbolValue.$REMOVE_PROXY_WATCH] = id);
	} else {
		isNotDataProxy();
	}
}
