import { Router } from '@kotron/global';

import HomeVue from './views/Home/index.vue';

import GuideVue from './views/Guide/index.vue';
import DataProxyVue from './views/Guide/DataProxy/index.vue';
import StateVue from './views/Guide/State/index.vue';
import HistoryVue from './views/Guide/History/index.vue';

import TestVue from './views/Test/index.vue';

import NotFoundVue from './views/NotFound.vue';

const { NODE_ENV } = process.env;

const routeConfig: Router.Config[] = [
	{
		label: '首页',
		name: 'Home',
		component: HomeVue,
	},
	{
		label: '指南',
		name: 'Guide',
		component: GuideVue,
		children: [
			{
				label: '数据代理',
				name: 'DataProxy',
				component: DataProxyVue,
			},
			{
				label: '状态管理',
				name: 'State',
				component: StateVue,
			},
			{
				label: '历史记录',
				name: 'History',
				component: HistoryVue,
			},
		],
	},
];

if (NODE_ENV == 'development') {
	routeConfig.push({
		label: '测试',
		name: 'Test',
		component: TestVue,
	});
}

const { router } = Router.use(routeConfig, {
	routes: [
		{
			path: '/:pathMatch(.*)',
			name: 'NotFound',
			component: NotFoundVue,
		},
	],
});

export default router;
