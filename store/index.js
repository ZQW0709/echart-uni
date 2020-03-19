import Vue from 'vue'
import Vuex from 'vuex'

/* 引入各部分组件 */
import home from '@/store/modules/home'
import trip from '@/store/modules/trip'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		/**
		 * 是否需要强制登录
		 */
		forcedLogin: false,
		hasLogin: false,
		userName: ""
	},
	mutations: {
		login(state, userName) {
			state.userName = userName || '新用户';
			state.hasLogin = true;
		},
		logout(state) {
			state.userName = "";
			state.hasLogin = false;
		}
	},
	modules: {
	    home,
	    trip
	  }
})

export default store
