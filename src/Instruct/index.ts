import { DataProxy } from '../DataProxy';

/**
 * 指令
 */
export interface Instruct<
	T extends DataProxy.Type = DataProxy.Type,
	K extends keyof T = keyof T
> {
	/**
	 * 判断是否为代理对象
	 */
	$IS_PROXY: null;
	/**
	 * 判断是否为保护对象
	 */
	$IS_PROTECT: Instruct.DetermineAttr<K>;
	/**
	 * 判断是否为只读对象
	 */
	$IS_READONLY: Instruct.DetermineAttr<K>;
	/**
	 * 受保护赋值认证
	 */
	$PROXY_PROTECT_SETTER_AUTH: boolean;
	/**
	 * 为代理对象添加观察
	 */
	$ADD_PROXY_WATCH: [string, DataProxy.WatchOptions<T[K]>];
	/**
	 * 为代理对象移除观察
	 */
	$REMOVE_PROXY_WATCH: string;
	/**
	 * 数组操作拦截
	 */
	$ARRAY_OPERATE_INTERCEPT: boolean;
	/**
	 * 获取代理对象的原始目标数据
	 */
	$GET_TARGET: null;
	/**
	 * 获取上级代理对象
	 */
	$GET_SUPERIOR_PROXY: null;
	/**
	 * 获取代理选项
	 */
	$GET_PROXY_OPTIONS: null;
	/**
	 * 获取代理数据集
	 */
	$GET_PROXY_DATASET: null;
	/**
	 * 获取代理对象数据路径
	 */
	$GET_PROXY_PATH: Instruct.GetterAttrPath<T>;
	/**
	 * 获取初始值
	 */
	$GET_ORIGIN_VALUE: Instruct.GetterAttrOriginValue<T>;
	/**
	 * 获取数据记录
	 */
	$GET_DATA_RECORD: Instruct.GetterDataRecord<T>;
	/**
	 * 设置数据记录
	 */
	$SET_DATA_RECORD: Instruct.SetDataRecord<T>;
	/**
	 * 设置为受保护对象
	 */
	$SET_PROXY_PROTECT: K;
	/**
	 * 设置为只读对象
	 */
	$SET_PROXY_READONLY: K;
}
export namespace Instruct {
	/**
	 * 指令符号值
	 */
	export const SymbolValue: Record<keyof Instruct, symbol> = {
		$IS_PROXY: Symbol('is proxy'),
		$IS_PROTECT: Symbol('is protect'),
		$IS_READONLY: Symbol('is readonly'),
		$PROXY_PROTECT_SETTER_AUTH: Symbol('proxy protect setter auth'),
		$ADD_PROXY_WATCH: Symbol('add proxy watch'),
		$REMOVE_PROXY_WATCH: Symbol('remove proxy watch'),
		$ARRAY_OPERATE_INTERCEPT: Symbol('array operate intercept'),
		$GET_TARGET: Symbol('get target'),
		$GET_SUPERIOR_PROXY: Symbol('get superior proxy'),
		$GET_PROXY_OPTIONS: Symbol('get proxy options'),
		$GET_PROXY_DATASET: Symbol('get proxy dataset'),
		$GET_PROXY_PATH: Symbol('get proxy path'),
		$GET_ORIGIN_VALUE: Symbol('get origin value'),
		$GET_DATA_RECORD: Symbol('get data record'),
		$SET_DATA_RECORD: Symbol('set data record'),
		$SET_PROXY_PROTECT: Symbol('set proxy protect'),
		$SET_PROXY_READONLY: Symbol('set proxy readonly'),
	};

	/**
	 * 判断属性
	 */
	export type DetermineAttr<T> = (resolve: (attr: T) => boolean) => boolean;

	/**
	 * 获取属性数据路径
	 */
	export type GetterAttrPath<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	> = (resolve: (attr: K) => K[]) => void;

	/**
	 * 获取属性原始值
	 */
	export type GetterAttrOriginValue<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	> = (resolve: (attr: K) => T[K]) => void;

	/**
	 * 获取数据记录
	 */
	export type GetterDataRecord<
		T extends DataProxy.Type,
		K extends keyof T = keyof T
	> = (resolve: (attr: K) => DataProxy.DataRecord<T[K]>) => void;

	/**
	 * 设置数据记录
	 */
	export type SetDataRecord<T, K extends keyof T = keyof T> =
		| Instruct.SetDataRecordParams<T>
		| [K, Instruct.SetDataRecordParams<T[K]>];

	/**
	 * 设置数据记录参数
	 */
	export interface SetDataRecordParams<T> {
		/**
		 * 当前值
		 */
		currentValue: T;
		/**
		 * 上一次的值
		 */
		oldValue: T;
		/**
		 * 记录类型
		 */
		type?: DataProxy.DataRecord.Type;
		/**
		 * 冒泡对象
		 */
		bubble?: DataProxy.DataRecord;
	}
}
