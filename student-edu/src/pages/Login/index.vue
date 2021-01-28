<template>
	<div class="page-wrapper">
		<div class="logo-wrapper">
			<h1>学生后台管理系统</h1>
		</div>
		<!--model是绑定数据-->
		<el-form  :rules="rules" ref="user" :model="user" status-icon>
			<h2>登录</h2>
			<el-form-item prop="user_name">
				<el-input suffix-icon="el-icon-s-custom" v-model="user.user_name">
					<template slot="prepend"><span class="prepent-text">用户名：</span></template>
				</el-input>
			</el-form-item>
			<el-form-item prop="user_pwd">
				<el-input suffix-icon="el-icon-lock" v-model="user.user_pwd" show-password>
					<template slot="prepend"><span class="prepent-text">密码：</span></template>
				</el-input>
			</el-form-item>
			<el-form-item class="button-wrapper">
				<el-button type="info" plain @click="login('user')">登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">
	export default {
	        name: 'Login',
		data() {
	                return {
	                        user: {
	                                user_name: '',
		                        user_pwd: '',
	                        },
                                rules: {
                                        user_name: [
                                                {required: true, message: '* 请输入用户名', trigger: 'blur'},
                                                {min: 3, max: 20, message: '* 长度在3-20个字符', trigger: 'blur'},
                                        ],
                                        user_pwd: [
                                                {required: true, message: '* 请输入密码', trigger: 'blur'},
                                                {min: 3, max: 20, message: '* 密码长度在3-20个字符', trigger: 'blur'},
	                                ],
                                },
	                }
		},
		methods: {
	                // async login() {
			// 	let token = await this.$http({
			//                 url: '/user/login',
			// 		method: 'post',
			// 		data: this.user,
		        //         });
		        //         sessionStorage.setItem('token', token);
			// 	sessionStorage.setItem('user_name', this.user.user_name);
		        //         this.$router.replace('/home');
	                // },
                        login(formName) {
                                this.$refs[formName].validate((valid) => {
                                        if (valid) {
                                                let token = this.$http({
                                                        url: '/user/login',
                                                        method: 'post',
                                                        data: this.user,
                                                }).then(token => {
                                                        sessionStorage.setItem('token', token);
                                                        sessionStorage.setItem('user_name', this.user.user_name);
                                                        this.$router.replace('/home');
                                                });

                                        } else {
                                                console.log('error submit!!');
                                                return false;
                                        }
                                });
                        },
		},
	}
</script>

<style scoped lang="stylus" type="text/stylus">
	@keyframes aaa
		0% {transform: rotateY(0deg)}
		100% {transform: rotateY(30deg)}
	@keyframes bbb
		0% {transform: translateY(-50%) translate(0%)}
		100% {transform: translateY(-50%) translate(27%)}
	.logo-wrapper
		/* 开启3D效果 */
		perspective: 500px
		position fixed
		top 50%
		right 50%
		transform translateY(-50%) translate(0%)
		animation-name bbb
		animation-duration 1s
		animation-fill-mode forwards
		animation-delay 1s
		h1
			animation-name aaa
			animation-duration 1s
			animation-fill-mode forwards
			border-bottom 1px solid #000
			transform-origin left center
			font-size 80px
			text-shadow -15px 15px 10px #000
			white-space nowrap
			padding 20px 50px
			color #b0b0b0
			position relative

	.el-form
		width 400px
		/*border 1px solid #b0b0b0*/
		padding 30px 40px
		border-radius 8px
		position fixed
		left 50%
		top 50%
		transform translateY(-50%)
		box-shadow 0 0 15px 1px #000
		h2
			margin-bottom 15px
			color #7b7b7b
			font-size 25px
			text-align center
		span.prepent-text
			display inline-block
			width 60px
		.button-wrapper
			text-align right
</style>