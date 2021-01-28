import Vue from 'vue';
import app from './App';
import './assets/reset.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router';
import http from './utils/http.js';
import store from "./store";


Vue.use(ElementUI)
Vue.prototype.$http = http;

new Vue({
        el: '#app',
        components: {
                app,
        },
        template: '<app></app>',
        router,
        store,
})