import { DataProxy } from './../DataProxy';

/**
 * 历史记录
 */
export type History<T> = DataProxy.DataRecord<T>[];
export namespace History {
	export function use<T extends DataProxy.Type>(proxy: DataProxy<T>) {}
}
