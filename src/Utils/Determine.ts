import { Instruct } from '../Instruct';
import { DataProxy } from '../DataProxy';

import { isNotDataProxy } from './NotDataProxy';

/**
 * 判读目标是否为代理对象
 * @param target 需要判断的目标
 * @returns
 */
export function isProxy<T>(target: T) {
	return target && target[Instruct.SymbolValue.$IS_PROXY] === true;
}

/**
 * 判断代理对象是否受保护
 * @param proxy 需要判断的代理对象
 * @returns
 */
export function isProtected<T extends DataProxy.Type>(proxy: T): boolean;
/**
 * 判断代理对象的属性是否受保护
 * @param proxy 需要判断的代理对象
 * @param key 需要判断的属性
 * @returns
 */
export function isProtected<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T, key: K): boolean;
export function isProtected<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(...params) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (proxy[Instruct.SymbolValue.$IS_PROTECT]) {
			return true;
		} else {
			let res = false;
			if (params.length > 1) {
				proxy[Instruct.SymbolValue.$IS_PROTECT] = <
					Instruct['$IS_PROTECT']
				>((resolve) => {
					res = resolve(<never>key);
					return res;
				});
			}
			return res;
		}
	} else {
		isNotDataProxy();
		return false;
	}
}

/**
 * 判断代理对象是否只读
 * @param proxy 需要判断的代理对象
 * @returns
 */
export function isReadonly<T extends DataProxy.Type>(proxy: T): boolean;
/**
 * 判断代理对象的属性是否只读
 * @param proxy 需要判断的代理对象
 * @param key 需要判断的属性
 * @returns
 */
export function isReadonly<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(proxy: T, key: K): boolean;
export function isReadonly<
	T extends DataProxy.Type,
	K extends keyof T = keyof T
>(...params) {
	const [proxy, key] = <[T, K]>params;
	if (isProxy(proxy)) {
		if (proxy[Instruct.SymbolValue.$IS_READONLY]) {
			return true;
		} else {
			let res = false;
			if (params.length > 1) {
				proxy[Instruct.SymbolValue.$IS_READONLY] = <
					Instruct['$IS_READONLY']
				>((resolve) => {
					res = resolve(<never>key);
					return false;
				});
			}
			return res;
		}
	} else {
		isNotDataProxy();
		return false;
	}
}

/**
 * 判断代理对象是否已通过保护赋值认证
 * @param proxy 需要判断的代理对象
 * @returns
 */
export function isProtectAuth<T extends DataProxy.Type>(proxy: T) {
	if (isProxy(proxy)) {
		return proxy[Instruct.SymbolValue.$PROXY_PROTECT_SETTER_AUTH] === true;
	} else {
		isNotDataProxy();
		return false;
	}
}

/**
 * 代理对象是否启用数组操作拦截
 * @param proxy 代理对象
 */
export function isArrayOperateIntercept<T extends DataProxy.Type>(proxy: T) {
	if (proxy) {
		return proxy[Instruct.SymbolValue.$ARRAY_OPERATE_INTERCEPT] === true;
	} else {
		isNotDataProxy();
	}
}
