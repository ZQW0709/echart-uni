<template>
	<view class="content login">
				
		      <image :src="require('../../assets/img/logo.png')" mode="scaleToFill" style="width: 70vw;height: 200rpx;margin-left: 15vw;"></image>
		<view class="input-group">
			<view class="input-row border">
				<text class="title">账号：</text>
				<m-input class="m-input" type="text" clearable focus v-model="user.phone" placeholder="请输入账号"></m-input>
			</view>
			<view class="input-row">
				<text class="title">密码：</text>
				<m-input type="password" displayable v-model="user.password" placeholder="请输入密码"></m-input>
			</view>
		</view>
		<view class="btn-row" @tap="bindLogin">
			<image :src="require('../../static/img/login.png')" mode="scaleToFill" style="width: 20vw;height: 20vw;margin-left: 32vw;"></image>
		</view>
		<view class="action-row">
			<navigator url="../reg/reg">注册账号</navigator>
			<text>|</text>
			<navigator url="../pwd/pwd">忘记密码</navigator>
		</view>
		<view class="oauth-row" v-if="hasProvider" v-bind:style="{top: positionTop + 'px'}">
			<view class="oauth-image" v-for="provider in providerList" :key="provider.value">
				<image :src="provider.image" @tap="oauth(provider.value)"></image>
				<!-- #ifdef MP-WEIXIN -->
				<button v-if="!isDevtools" open-type="getUserInfo" @getuserinfo="getUserInfo"></button>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import service from '../../service.js';
	import {
		mapState,
		mapMutations,
		mapActions,
	} from 'vuex'
	import mInput from '../../components/m-input.vue'

	export default {
		components: {
			mInput
		},
		data() {
			return {
				providerList: [],
				hasProvider: false,
				account: '',
				password: '',
				positionTop: 0,
				isDevtools: false,
				
				userData: null,
				      user: {
				        phone: '15330734121',
				        password: '12345'
				      },
					  src:'../../assets/img/logo.png',
			}
		},
		computed: mapState(['forcedLogin']),
		methods: {
			...mapMutations(['login']),
			// ...mapActions(['setUser', 'setUserData']),
			...mapActions({
				setUser:'setUser',
				setUserData:'setUserData'
			}),
			initProvider() {
				const filters = ['weixin', 'qq', 'sinaweibo'];
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						if (res.provider && res.provider.length) {
							for (let i = 0; i < res.provider.length; i++) {
								if (~filters.indexOf(res.provider[i])) {
									this.providerList.push({
										value: res.provider[i],
										image: '../../static/img/' + res.provider[i] + '.png'
									});
								}
							}
							this.hasProvider = true;
						}
					},
					fail: (err) => {
						console.error('获取服务供应商失败：' + JSON.stringify(err));
					}
				});
			},
			initPosition() {
				/**
				 * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
				 * 反向使用 top 进行定位，可以避免此问题。
				 */
				this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
			},
			bindLogin() {
				/**
				 * 客户端对账号信息进行一些必要的校验。
				 * 实际开发中，根据业务需要进行处理，这里仅做示例。
				 */
				console.log(this.user);
				if (this.user.phone.length < 11) {
					uni.showToast({
						icon: 'none',
						title: '手机号最短为11 个字符'
					});
					return;
				}
				// if (this.user.password.length < 6) {
				// 	uni.showToast({
				// 		icon: 'none',
				// 		title: '密码最短为 6 个字符'
				// 	});
				// 	return;
				// }
				/**
				 * 下面简单模拟下服务端的处理
				 * 检测用户账号密码是否在已注册的用户列表中
				 * 实际开发中，使用 uni.request 将账号信息发送至服务端，客户端在回调函数中获取结果信息。
				 */
				// const data = {
				// 	account: this.account,
				// 	password: this.password
				// };
				// const validUser = service.getUsers().some(function(user) {
				// 	return data.account === user.account && data.password === user.password;
				// });
				// if (validUser) {
				// 	this.toMain(this.account);
				// } else {
				// 	uni.showToast({
				// 		icon: 'none',
				// 		title: '用户账号或密码不正确',
				// 	});
				// }
				let params = {
				        userName: this.user.phone,
				        passWord: this.user.password
				      }
				const requestTask = uni.request({
				    url: 'http://192.168.1.31:3000/user', 
					method:'POST',
				    data: params,
					success: (res => {
						this.userData = res.data
						let tmpUser = JSON.stringify(this.userData)
						localStorage.setItem('user', tmpUser)
						// 存到vuex
						        this.setUser(this.userData)
						        this.allDistanceAjax()
								uni.navigateTo({
								    url: '../trip/trip'
								});
					})
				});	  
			},
			allDistanceAjax () {
			      // this.$http.get('/trip/allDistance', {}).then(res => {
			      //   this.setUserData(res.data.data)
			      // })
				  const requestTask = uni.request({
					   url: 'http://192.168.1.31:3000/trip/allDistance',
					   data: {
						   userId: 1
					   },
					   success:(res => {
						   console.log(res);
					   })
				  })
			    },
			oauth(value) {
				uni.login({
					provider: value,
					success: (res) => {
						uni.getUserInfo({
							provider: value,
							success: (infoRes) => {
								/**
								 * 实际开发中，获取用户信息后，需要将信息上报至服务端。
								 * 服务端可以用 userInfo.openId 作为用户的唯一标识新增或绑定用户信息。
								 */
								this.toMain(infoRes.userInfo.nickName);
							},
							fail() {
								uni.showToast({
									icon: 'none',
									title: '登陆失败'
								});
							}
						});
					},
					fail: (err) => {
						console.error('授权登录失败：' + JSON.stringify(err));
					}
				});
			},
			getUserInfo({
				detail
			}) {
				if (detail.userInfo) {
					this.toMain(detail.userInfo.nickName);
				} else {
					uni.showToast({
						icon: 'none',
						title: '登陆失败'
					});
				}
			},
			toMain(userName) {
				this.login(userName);
				/**
				 * 强制登录时使用reLaunch方式跳转过来
				 * 返回首页也使用reLaunch方式
				 */
				if (this.forcedLogin) {
					uni.reLaunch({
						url: '../main/main',
					});
				} else {
					uni.navigateBack();
				}

			}
		},
		onReady() {
			this.initPosition();
			this.initProvider();
			// #ifdef MP-WEIXIN
			this.isDevtools = uni.getSystemInfoSync().platform === 'devtools';
			// #endif
		}
	}
</script>


<style>
	.login{
		background: url("../../assets/img/login-bg.jpg");
		  background-size: 100% 100%;
	}
	.loing-title{
		width: 100vw;
		height: 20vh;
		background: url("../../assets/img/logo.png");
	}
	.action-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
	}

	.action-row navigator {
		color: #007aff;
		padding: 0 10px;
	}

	.oauth-row {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}

	.oauth-image {
		position: relative;
		width: 50px;
		height: 50px;
		border: 1px solid #dddddd;
		border-radius: 50px;
		margin: 0 20px;
		background-color: #ffffff;
	}

	.oauth-image image {
		width: 30px;
		height: 30px;
		margin: 10px;
	}

	.oauth-image button {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>
