/**
 * Created by chendaye666 on 17/8/5.
 */
import Vue from 'vue'
import ElementUI from 'element-ui';
import {
	sync
} from 'vuex-router-sync'
import App from './App.vue'
import router from './router'

window.jQuery = window.$ = require('jquery/dist/jquery')
Vue.use(ElementUI);
const app = new Vue({
	router,
	...App
})


export {
	app,
	router
}