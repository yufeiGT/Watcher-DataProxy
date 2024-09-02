import * as Spanner from '@~crazy/spanner';

import { buildDataProxy } from './buildDataProxy';

/**
 * 数据代理
 * @param target 需要构建数据代理的目标
 */
export function DataProxy<T extends DataProxy.Type>(target: T) {
	return buildDataProxy(target);
}
export namespace DataProxy {
	/**
	 * 数据类型
	 */
	export type Type = object | [];

	/**
	 * 移除监听钩子
	 */
	export type RemoveListen = () => void;

	/**
	 * 选项
	 */
	export interface Options<
		T extends DataProxy.Type = DataProxy.Type,
		K extends keyof T = keyof T
	> {
		/**
		 * 上级代理
		 */
		superiorDataProxy: T;
		/**
		 * 上级代理数据集
		 */
		superiorDataSet: DataSet<T>;
		/**
		 * 当前数据键值
		 */
		key: K;
	}
	export namespace Options {
		/**
		 * 获取默认值
		 * @returns
		 */
		export function getDefault<T extends DataProxy.Type>(): Options<T> {
			return {
				superiorDataProxy: null,
				superiorDataSet: null,
				key: null,
			};
		}

		/**
		 * 获取选项
		 * @param options 可选的选项
		 * @returns
		 */
		export function getOptions<T extends DataProxy.Type>(
			options: Partial<Options<T>>
		) {
			return Spanner.merge(getDefault(), options) as Options<T>;
		}
	}

	/**
	 * 数据集
	 */
	export interface DataSet<
		T extends DataProxy.Type = DataProxy.Type,
		K extends keyof T = keyof T
	> {
		/**
		 * 数据路径
		 */
		path: K[];
		/**
		 * 数据键值
		 */
		key: K;
		/**
		 * 创建时的时间戳
		 */
		timestamp: number;
		/**
		 * 原始数据
		 */
		originValue: T;
		/**
		 * 代理对象是否已通过保护认证
		 */
		isProtectAuth: boolean;
		/**
		 * 代理对象是否为保护状态
		 */
		isProtect: boolean;
		/**
		 * 代理对象是否为只读状态
		 */
		isReadonly: boolean;
		/**
		 * 数组操作拦截
		 */
		arrayOperateIntercept: boolean;
		/**
		 * 子代理对象列表
		 */
		childDataProxyMap: Map<keyof T, T>;
		/**
		 * 自身数据记录，如有上级代理，则为 null
		 */
		selfDataRecord: DataRecord<T>;
		/**
		 * 自身观察列表，如有上级代理，则为 null
		 */
		selfWatchMap: Map<string, Omit<WatchOptions, 'key' | 'immediate'>>;
		/**
		 * 子属性数据记录列表
		 */
		attrDataRecordMap: Map<keyof T, DataRecord<T[keyof T]>>;
		/**
		 * 子属性观察列表
		 */
		attrWatchMap: Map<string, Omit<WatchOptions, 'immediate'>>;
		/**
		 * 子属性观察映射列表
		 */
		attrMappingWatchMap: Map<string, string[]>;
		/**
		 * 包含新增的子属性对象列表
		 */
		attrIsNewMap: Map<keyof T, boolean>;
		/**
		 * 子属性对象保护列表
		 */
		attrProtectMap: Map<keyof T, boolean>;
		/**
		 * 子属性只读列表
		 */
		attrReadonlyMap: Map<keyof T, boolean>;
	}
	export namespace DataSet {
		/**
		 * 获取默认数据集
		 * @returns
		 */
		export function getDefault<T extends DataProxy.Type>(): DataSet<T> {
			return {
				path: [],
				key: null,
				timestamp: Date.now(),
				originValue: null,
				isProtectAuth: false,
				isProtect: false,
				isReadonly: false,
				arrayOperateIntercept: false,
				childDataProxyMap: new Map(),
				selfDataRecord: null,
				selfWatchMap: null,
				attrDataRecordMap: new Map(),
				attrWatchMap: new Map(),
				attrMappingWatchMap: new Map(),
				attrIsNewMap: new Map(),
				attrProtectMap: new Map(),
				attrReadonlyMap: new Map(),
			};
		}

		/**
		 * 获取数据集
		 * @param options 可选的数据集选项
		 * @returns
		 */
		export function getDataSet<T extends DataProxy.Type>(
			options: Partial<DataSet<T>>
		) {
			return Spanner.merge(getDefault(), options) as DataSet<T>;
		}
	}

	/**
	 * 记录
	 */
	export interface DataRecord<T = any> {
		/**
		 * 记录产生的时间戳
		 */
		timestamp: number;
		/**
		 * 当前记录属性行为类型
		 */
		type: DataRecord.Type;
		/**
		 * 数据路径
		 */
		path: any[];
		/**
		 * 发生变化的属性名
		 */
		key: any;
		/**
		 * 是否为初始化后新增的属性
		 * （在初始后未改变过的数据） 和 （之后新增的属性） 的 type 类型都是 Add
		 * 特意添加此属性用于识别
		 */
		isNew: boolean;
		/**
		 * 是否更改过此属性，修改和删除都会为 true
		 */
		hasChange: boolean;
		/**
		 * 初次赋值的原始值
		 */
		originValue: T;
		/**
		 * 上一次的值，初始化是为 null
		 */
		oldValue: T;
		/**
		 * 当前值
		 */
		value: T;
		/**
		 * 存在此属性代表此记录为冒泡触发的，并不是当前记录触发的
		 * bubble 表示原始修改的属性
		 */
		bubble: DataRecord;
	}
	export namespace DataRecord {
		/**
		 * 获取默认数据记录
		 * @returns
		 */
		export function getDefault<T = any>(): DataRecord<T> {
			return {
				timestamp: Date.now(),
				type: 'Add',
				path: [],
				key: null,
				isNew: false,
				hasChange: false,
				originValue: null,
				oldValue: null,
				value: null,
				bubble: null,
			};
		}

		/**
		 * 获取数据记录
		 * @param options
		 * @returns
		 */
		export function getDataRecord<T = any>(
			options: Partial<DataRecord<T>>
		) {
			return Spanner.merge(getDefault(), options) as DataRecord<T>;
		}

		/**
		 * 数据记录类型
		 */
		export type Type = 'Add' | 'Update' | 'Remove';
	}

	/**
	 * 观察选项
	 */
	export interface WatchOptions<T = any> {
		/**
		 * 监听的属性值
		 */
		key: string | string[];
		/**
		 * 观察回调
		 * @param record 当前数据记录，需要留意是否包含 bubble 冒泡属性
		 * @returns
		 */
		handler:
			| WatchOptions.WatchHandler<T>
			| WatchOptions.MultipleWatchHandler<T>;
		/**
		 * 立即触发
		 */
		immediate: boolean;
		/**
		 * 深度观察
		 * @description 开启深度观察时会触发冒泡功能
		 */
		deep: boolean;
	}
	export namespace WatchOptions {
		/**
		 * 观察回调
		 */
		export type WatchHandler<T> = (record: DataRecord<T>) => void;

		/**
		 * 多个属性观察回调
		 */
		export type MultipleWatchHandler<T> = (
			records: DataRecord<T>[],
			trigger: DataRecord
		) => void;
	}
}
