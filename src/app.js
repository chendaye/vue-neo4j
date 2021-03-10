/**
 * Created by chendaye666 on 17/8/5.
 */
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App.vue'
Vue.use(ElementUI);

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