/**
 * 判断是否为状态管理
 */
export const $IS_STATE = Symbol('is state');

/**
 * 推送
 */
export const $PUSH = Symbol('shadow to target');

/**
 * 拉取
 */
export const $PULL = Symbol('target to shadow');

/**
 * 重置
 */
export const $RESET = Symbol('reset shadow and target');

/**
 * 获取差异
 */
export const $DIFF = Symbol('get diff');

/**
 * 获取属性差异
 */
export type GetAttrDiff<T, K extends keyof T = keyof T> = (
	resolve: (attr: K) => T[K]
) => void;

/**
 * 添加事件监听
 */
export const $ADD_EVENT_LISTEN = Symbol('add event listen');
