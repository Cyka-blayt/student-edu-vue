<template>
	<div>
		<el-form label-width="120px" :rules="rules" ref="form" :model="model">
			<el-form-item label="原始密码：" prop="oldPwd">
				<el-input v-model="model.oldPwd" show-password></el-input>
			</el-form-item>
			<el-form-item label="新密码：" prop="newPwd">
				<el-input v-model="model.newPwd" show-password></el-input>
			</el-form-item>
			<el-form-item label="新密码确认：" prop="checkPass">
				<el-input show-password></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="saveChangePwd">确定</el-button>
			</el-form-item>
		</el-form>
<!--		这是修改密码组件-->
<!--		<demo :a.sync="aa" v-model="bb">-->
<!--			<span>这是内容标签</span>-->
<!--			<p>这是p标签</p>-->
<!--			<span slot="a1" slot-scope="scope">-->
<!--				<span v-text="scope.name1"></span>-->
<!--				<span v-text="scope.age"></span>-->
<!--			</span>-->
<!--			<span slot="a2">这是内容2</span>-->
<!--			<span slot="a3">这是内容3</span>-->
<!--			<span slot="a4" slot-scope="{name1, age}">-->
<!--				<p v-text="name1"></p>-->
<!--				<p v-text="age"></p>-->
<!--			</span>-->
<!--		</demo>-->
	</div>
</template>

<script type="text/ecmascript-6">
	import demo from "../../components/demo";

        export default {
                name: 'ChangePwd',
	        data() {
                        return {
                                model: {
                                        oldPwd: '',
	                                newPwd: '',
                                        checkPass: ''
                                },
	                        rules: {
					oldPwd: [
						{required: true, message: '请输入旧密码',  trigger: 'blur'},
						{min: 3, max: 20, message:  '密码长度 3 - 20', trigger: 'blur'}
					],
		                        newPwd: [
                                                // {required: true, message: '请输入新密码',  trigger: 'blur'},
                                                // {min: 3, max: 20, message:  '密码长度 3 - 20', trigger: 'blur'},
			                        {
                                                        validator: (rule, value, callback) => {
                                                                if(value === '') {
                                                                        callback(new Error('* 请输入密码'));
                                                                } else if(value.length < 3 || value.length > 20) {
                                                                        callback(new Error('* 密码长度为 3 - 20'))
                                                                }else if(value === this.model.oldPwd) {
                                                                        callback(new Error('* 你是der嘛？新老密码一致'))
                                                                } else {
                                                                        callback()
                                                                }
                                                        },
                                                        trigger: 'blur'
			                        }
		                        ],
		                        checkPass: [{
                                                validator: (rule, value, callback) => {
                                                        if(value === '') {
                                                                callback(new Error('* 请再次输入密码'));
                                                        } else if(value !== this.model.newPwd) {
                                                                callback(new Error('* 两次密码输入不一致'))
                                                        } else {
                                                                callback()
                                                        }
                                                },
			                        trigger: 'blur'
                                        }]
	                        },
                        }
	        },
	        methods: {
		        saveChangePwd() {
                                this.$refs.form.validate(async valid =>{
                                        if (!valid) return;
                                        await this.$http({
	                                        url: '/user/pwdchange',
	                                        method: 'post',
	                                        data: model
                                        })
                                })
                        }
	        }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-input {
		width 300px
	}
</style>