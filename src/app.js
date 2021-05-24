/**
 * Created by chendaye666 on 17/8/5.
 */
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueCookies from 'vue-cookies'


import App from './App.vue'
Vue.use(ElementUI);
Vue.use(VueCookies)


import router from './router'

import {
	sync
} from 'vuex-router-sync'
window.jQuery = window.$ = require('jquery/dist/jquery')
const app = new Vue({
	router,
	...App
})


export {
	app,
	router
}