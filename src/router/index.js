import {createRouter, createWebHashHistory} from 'vue-router'
import storeF from '@/store'
const state = storeF.getters;

function lazyLoad(view){
	return() => import(`@/views/${view}`)
}

const routes = [
	{
		path: '/',
		redirect: '/dashboard'
	},
	{
		path: '/dashboard',
		component: lazyLoad('dashboard/DashboardRoot'),
		redirect: '/dashboard/home',
		children: [
			{
				path: 'home',
				component: lazyLoad('dashboard/dashboard/DashboardRoot')
			},
			{
				path: 'shockers',
				component: lazyLoad('dashboard/shockers/ShockersRoot'),
				redirect: '/dashboard/shockers/own',
				children: [
					{
						path: 'own',
						component: lazyLoad('dashboard/shockers/own/Own')
					},
					{
						path: 'shared',
						component: lazyLoad('dashboard/shockers/shared/Shared')
					},
					{
						path: ':id/shares',
						component: lazyLoad('dashboard/shockers/own/shares/ShockerSharesRoot')
					},
					{
						path: ':id/logs',
						component: lazyLoad('dashboard/shockers/own/ShockerLogs')
					},
				]
			},
			{
				path: 'shares',
				component: lazyLoad('dashboard/shares/SharesRoot'),
				redirect: '/dashboard/shares/links',
				children: [
					{
						path: 'links',
						component: lazyLoad('dashboard/shares/links/ShareLinksRoot')
					},
					{
						path: 'links/:id',
						component: lazyLoad('dashboard/shares/links/ViewShareLink'),
						props: route => ({id: route.params.id, publicMode: false })
					}
				]
			},
			{
				path: 'profile',
				component: lazyLoad('dashboard/profile/ProfileRoot'),
				redirect: '/dashboard/profile/account',
				children: [
					{
						path: 'account',
						component: lazyLoad('dashboard/profile/Account')
					},
					{
						path: 'license',
						component: lazyLoad('dashboard/profile/License')
					}
				]
			},
			{
				path: 'devices',
				component: lazyLoad('dashboard/devices/DevicesRoot')
			},
			{
				path: 'devices/:id/setup',
				component: lazyLoad('dashboard/devices/Setup/Setup')
			},
			{
				path: 'devices/:id/ota',
				component: lazyLoad('dashboard/devices/Ota/OtaUpdate'),
				props: true
			},
			{
				path: 'tokens',
				component: lazyLoad('dashboard/ApiTokens/ApiTokenRoot')
			},
		]
	},
	{
		path: '/account',
		component: lazyLoad('Login/AppRoot'),
		redirect: '/account/login',
		children: [
			{
				path: 'login',
				component: lazyLoad('Login/Login')
			}
		]
	},
	{
		path: '/public',
		component: lazyLoad('public/PublicRoot'),
		children: [
			{
				path: 'home',
				component: lazyLoad('public/Home')
			},
			{
				path: 'shares/links/:id',
				component: lazyLoad('dashboard/shares/links/ViewShareLink'),
				props: route => ({id: route.params.id, publicMode: true })
			},
			{
				path: 'proxy/shares/links/:id',
				component: lazyLoad('public/proxy/ShareLinksProxy'),
				props: true
			},
			{
				path: 'proxy/shares/code/:id',
				component: lazyLoad('public/proxy/ShareCodeProxy'),
				props: true
			},
			{
				path: 'proxy/token',
				component: lazyLoad('public/proxy/TokenProxy')
			},
		]
	}
]
const router = createRouter({
	history: createWebHashHistory(),
	routes
})

router.beforeEach((to, from, next) => {
	emitter.emit('route-before');
	next();
})

router.afterEach((to, from) => {
	emitter.emit('route-after');
})

export default router
