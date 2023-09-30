global.env = {
	COMMIT_HASH: process.env.COMMIT_HASH,
	TARGET_ENV: process.env.TARGET_ENV
};

require("@/globals/config/config." + process.env.TARGET_ENV + ".js");
require("@/js/utils.js");
import "bootstrap/scss/bootstrap.scss";
import ApiCall from '/src/js/ApiCall';
import toastr from 'toastr';
import * as Sentry from "@sentry/vue";

toastr.options = {
	"positionClass": "toast-bottom-right"
}
global.toastr = toastr;
global.apiCall = ApiCall;

import jQuery from 'jquery';
global.jQuery = jQuery;
global.$ = jQuery;
import {createApp} from 'vue';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'normalize.css';
import 'toastr/build/toastr.css';
import "@fontsource/poppins";

import "./App.scss";
import 'sweetalert2/dist/sweetalert2.min.css';
import App from '@/App';
import Footer from '@/Footer';
import router from '@/router';
import storeA from '@/store';
import mitt from 'mitt';
import BootstrapVueNext from 'bootstrap-vue-next'
import VueSweetalert2 from 'vue-sweetalert2';

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
library.add(fas, far, fab);
dom.watch();

const emitter = mitt();

const app = createApp(App)
	.use(router)
	.use(storeA)
	.use(BootstrapVueNext)
	.use(VueSweetalert2)
	.use(ContextMenu);

app.config.globalProperties.emitter = emitter;
app.config.devtools = true;
global.emitter = emitter;

Sentry.init({
	app,
	dsn: "https://052d20b68586c85c90b4e454bbf85a69@o4505946910949376.ingest.sentry.io/4505946978910208",
	integrations: [
	  new Sentry.BrowserTracing({
		// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
		tracePropagationTargets: ["localhost", "api.shocklink.net", "dev-api.shocklink.net", "shocklink.net"],
		routingInstrumentation: Sentry.vueRouterInstrumentation(router),
	  }),
	  new Sentry.Replay(),
	],
	// Performance Monitoring
	tracesSampleRate: 0.2, // Capture 100% of the transactions, reduce in production!
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });


app.mount('#app');

const footerApp = createApp(Footer)
.use(storeA);
footerApp.config.globalProperties.emitter = emitter;
footerApp.config.devtools = true;

footerApp.mount('#footerApp');