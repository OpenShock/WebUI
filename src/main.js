global.env = {
	COMMIT_HASH: process.env.COMMIT_HASH,
	TARGET_ENV: process.env.TARGET_ENV
};

require("@/globals/config/config." + process.env.TARGET_ENV + ".js");
require("@/js/utils.js");

import "bootstrap/scss/bootstrap.scss";
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'normalize.css';
import 'toastr/build/toastr.css';
import "@fontsource/poppins";
import "./App.scss";
import 'sweetalert2/dist/sweetalert2.min.css';
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

import { dom, library } from '@fortawesome/fontawesome-svg-core';

import ApiCall from '/src/js/ApiCall';
import App from '@/App';
import BootstrapVueNext from 'bootstrap-vue-next'
import ContextMenu from '@imengyu/vue3-context-menu'
import Footer from '@/Footer';
import VueSweetalert2 from 'vue-sweetalert2';
import {createApp} from 'vue';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import jQuery from 'jquery';
import mitt from 'mitt';
import router from '@/router';
import storeA from '@/store';
import toastr from 'toastr';
toastr.options = {
	"positionClass": "toast-bottom-right"
}
global.toastr = toastr;
global.apiCall = ApiCall;

global.jQuery = jQuery;
global.$ = jQuery;




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

app.mount('#app');

const footerApp = createApp(Footer)
.use(storeA);
footerApp.config.globalProperties.emitter = emitter;
footerApp.config.devtools = true;

footerApp.mount('#footerApp');