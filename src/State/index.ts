import * as Spanner from '@~crazy/spanner';

import { DataProxy } from '../DataProxy';
import { getProxyDataSet, getTarget, isProxy, protect } from '../Utils';
import { isNotDataProxy } from '../Utils/NotDataProxy';

import {
	$IS_STATE,
	$PUSH,
	$PULL,
	$RESET,
	$DIFF,
	GetAttrDiff,
	$ADD_EVENT_LISTEN,
} from './Instruct';

/**
 * 不是状态管理对象时输出错误提示
 */
export function isNotProxyState() {
	console.warn(`Uncaught ReferenceError: 'state' must be a proxy state`);
}

/**
 * 代理状态管理对象
 */
export interface ProxyState<T> {
	/**
	 * 目标对象
	 */
	target: Readonly<DataProxy<T>>;
	/**
	 * 影子对象
	 */
	shadow: T;
}
export namespace ProxyState {
	/**
	 * 事件列表
	 */
	export interface EventMap<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	> {
		(event: 'update', value: T, oldValue: T): void;
		update(value: T, oldValue: T): void;

		(event: 'push', value: T): void;
		push(value: T): void;

		(event: 'pull', value: T): void;
		pull(value: T): void;

		(event: 'reset', value: T): void;
		(event: 'reset', key: K, value: T[K]): void;
		reset(value: T): void;
		reset(key: K, value: T[K]): void;
	}

	/**
	 * 为代理对象应用状态管理
	 * @param proxy 代理对象
	 * @returns
	 */
	export function use<T>(proxy: DataProxy<T>): ProxyState<T> {
		if (isProxy(proxy)) {
			const setter = protect(proxy);
			const proxyDataSet = getProxyDataSet(proxy);
			const shadow = Spanner.clone(getTarget(proxy));
			return new Proxy<ProxyState<T>>(
				{
					target: proxy,
					shadow,
				},
				{
					set(target, key, value) {
						if (key === $RESET) {
						} else if (key === $DIFF) {
						} else {
							console.warn(
								'Uncaught ReferenceError: Not allowed to modify state'
							);
						}
						return true;
					},
					get(target, key) {
						if (key === $IS_STATE) {
							return true;
						} else if (key === $PUSH) {
							for (let i in proxy) {
								setter((target) => {
									// @ts-ignore
									target[i] = shadow[i];
								});
							}
						} else if (key === $PULL) {
						} else if (key === $DIFF) {
						}
						return Reflect.get(target, key);
					},
					deleteProperty() {
						console.warn(
							'Uncaught ReferenceError: Not allowed to delete state'
						);
						return true;
					},
				}
			);
		} else {
			isNotDataProxy();
			return;
		}
	}

	/**
	 * 判断目标是否为状态管理对象
	 * @param target 需要判断的目标
	 * @returns
	 */
	export function isState<T>(target): target is ProxyState<T> {
		return target && target[$IS_STATE] === true;
	}

	/**
	 * 将shadow推送到target
	 * @param state 状态管理对象
	 */
	export function push<T extends DataProxy.Type>(state: ProxyState<T>) {
		if (isState(state)) {
			state[$PUSH];
		} else {
			isNotProxyState();
		}
	}

	/**
	 * 从target拉取到shadow
	 * @param state 状态管理对象
	 */
	export function pull<T extends DataProxy.Type>(state: ProxyState<T>) {
		if (isState(state)) {
			state[$PULL];
		} else {
			isNotProxyState();
		}
	}

	/**
	 * 重置target和shadow为初始值
	 * @param state 状态管理对象
	 */
	export function reset<T extends DataProxy.Type>(state: ProxyState<T>): T;
	/**
	 * 重置target和shadow下的属性为初始值
	 * @param state 状态管理对象
	 * @param key 需要重置的属性
	 */
	export function reset<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	>(state: ProxyState<T>, key: K): T[K];
	export function reset<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	>(state: ProxyState<T>, key?: K) {
		if (isState(state)) {
			state[$RESET] = key;
		} else {
			isNotProxyState();
		}
	}

	/**
	 * 获取target与初始值的差异
	 * @param state 状态管理对象
	 */
	export function diff<T extends DataProxy.Type>(
		state: ProxyState<T>
	): Partial<T>;
	/**
	 * 获取target下的属性与初始值的差异
	 * @param state 状态管理对象
	 * @param key 需要获取的属性
	 */
	export function diff<T extends DataProxy.Type, K extends keyof T = keyof T>(
		state: ProxyState<T>,
		key: K
	): boolean;
	export function diff<T extends DataProxy.Type, K extends keyof T = keyof T>(
		...params
	) {
		const [state, key] = params as [ProxyState<T>, K];
		if (isState(state)) {
			if (params.length > 1) {
				let res: T[K];
				state[$DIFF] = ((resolve) => {
					res = resolve(key);
				}) as GetAttrDiff<T, K>;
				return res;
			} else {
				return state[$DIFF];
			}
		} else {
			isNotProxyState();
		}
	}

	/**
	 * 添加事件监听
	 * @param state 状态管理对象
	 * @param event 事件名称
	 * @param handler 回调函数
	 * @returns 移除监听函数
	 */
	export function on<
		T extends DataProxy.Type,
		K extends keyof EventMap<T> = keyof EventMap<T>
	>(
		state: ProxyState<T>,
		event: K,
		handler: (...params: Parameters<EventMap<T>[K]>) => void
	): () => void {
		if (isState(state)) {
			return () => {};
		} else {
			isNotProxyState();
		}
	}
}
