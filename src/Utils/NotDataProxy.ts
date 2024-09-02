/**
 * 不是代理对象时输出错误提示
 */
export function isNotDataProxy() {
	console.warn(`Uncaught ReferenceError: 'proxy' must be a data proxy`);
}
