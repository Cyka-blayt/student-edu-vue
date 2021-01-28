<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="用户名称：">
					<el-input placeholder="请输入搜索内容" prefix-icon="el-icon-search" v-model="search.user_name" clearable @change="getUser(true)"></el-input>
				</el-form-item>
				<el-form-item label="用户角色：">
					<el-select v-model="search.role_id" placeholder="- 请选择 -" @change="getUser(true)">
						<el-option label="- 全部 -" :value="-1"></el-option>
						<el-option label="- 无角色 -" :value="0"></el-option>
						<el-option
							v-for="item in list"
							:key="item.role_id"
							:label="item.role_name"
							:value="item.role_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="success" @click="beginAdd"><i class="el-icon-plus"></i> 新增</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="user" style="width: 100%" stripe border >
				<el-table-column label="#" type="index" width="80" align="center"></el-table-column>
				<el-table-column label="用户名" prop="user_name" width="180">

				</el-table-column>
				<el-table-column label="角色"  width="180">
					<template slot-scope="scope">
						<span v-text="user[scope.$index].role_id === null? '暂无角色': `${user[scope.$index].role_name}`"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button size="small" type="primary" @click="changePwd(scope.$index)"><i class="el-icon-edit-outline"></i> 编辑</el-button>
						<el-button size="small" type="danger" @click="remove(scope.$index)"><i class="el-icon-delete"></i> 删除</el-button>
						<el-popover placement="right" title="角色分配" width="600px" trigger="click">
							<el-form label-width="60px">
								<el-form-item label="角色：">
									<el-select v-model="model.role_id" placeholder="- 请选择角色 -" clearable>
										<el-option label="- 无角色 -" :value="null"></el-option>
										<el-option
											v-for="item in list"
											:key="item.role_id"
											:label="item.role_name"
											:value="item.role_id">
										</el-option>
									</el-select>
									<el-button @click="saveRole(scope.$index)">分配</el-button>
								</el-form-item>
							</el-form>
							<el-button size="small" type="success" slot="reference" @click="beginFuncConfig(scope.$index)"><i class="el-icon-setting"></i> 角色分配</el-button>
						</el-popover>

					</template>

				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				background
				:total="pagination.total"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				@current-change="getUser(false)"
				@size-change = "getUser(true)"
				:page-sizes="[5, 10, 15, 20]"
				layout="prev, pager, next, jumper, ->, sizes, total">
			</el-pagination>
		</el-footer>



		<el-dialog :visible="isEdit" :title="mode? '用户维护 - 新增': '用户维护 - 修改'" :modal="false" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" width="550px">
			<el-form label-width="100px" :model="model" :rules="rules" ref="form" status-icon @validate="formValidateHandler">
				<el-form-item label="用户名称：" prop="user_name">
					<el-input v-model.trim="model.user_name" :disabled="!mode"></el-input>
				</el-form-item>
				<el-form-item label="用户密码：" prop="user_pwd">
					<el-input v-model.trim="model.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
					<el-button type="primary" @click="save"><i class="el-icon-finished"></i> 保存</el-button>
					<el-button @click="isEdit = false">取消</el-button>
				</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import {createNamespacedHelpers} from 'vuex';
        let {mapState, mapActions} = createNamespacedHelpers('role');

	export default {
	        name: 'User',
		data() {
	                return {
	                        mode: true,                     // 默认为新增
	                        user: [],
		                total: 0,
		                isEdit: false,
		                model: {
	                                user_name: '',
			                user_pwd: '',
			                role_id: null,
                                        role_name: ''
		                },
		                rules:{
	                                user_name: [
		                                {
                                                        validator: async (rule, value, callback) => {
                                                                if (!this.mode)
                                                                        callback();
                                                                else if(!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value))
                                                                        callback(new Error('* 用户名 3 - 20位，且只能包含字母或数字,不能以数字开头'));
                                                                else if(await this.$http({method: 'post', url: '/user/valid_name', data: {user_name: value}}))
									callback(new Error('* 用户名已存在'));
                                                                else
                                                                        callback();
                                                        },
			                                trigger: 'blur'
		                                }

	                                ],
			                user_pwd: [
				                {required: true, message: '密码不能为空', trigger: 'blur'},
				                {min: 3, max: 5, message: '密码长度 3 - 20', trigger: 'blur'}
			                ],
		                },
		                search: {
	                                user_name: '',
			                role_id: -1,
		                },
		                pagination: {
	                                total: 0,
			                pageSize: 5,
			                currentPage: 1,
		                },
	                }
		},
		computed: {
	                ...mapState(['list']),
		},
		async created(){
                        this.init();
	                this.getUser();
                },
		methods: {
                        ...mapActions(['init']),
			async getUser(fromPage1 = true) {
				if(fromPage1) this.pagination.currentPage = 1;
                                let result = await this.$http({
                                        url: '/user/list',
                                        method: 'post',
                                        data: {
                                                ...this.search,
                                                begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
	                                        pageSize: this.pagination.pageSize,
                                        }
                                });
                                result.list.forEach(item => {
                                        let name = this.list.find(item3 => item3.role_id === item.role_id);
                                        item.role_name = this.list.some(item2 => item2.role_id === item.role_id)? name.role_name: '';
                                });
                                this.user = result.list;
                                this.pagination.total = result.total;
			},
                        changePwd(index){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.mode = false;
                                this.model.user_name = this.user[index].user_name;
                                this.model.user_pwd = this.user[index].user_pwd;
                                this.model.role_id = this.user[index].role_id;
                                this.isEdit = true;
                        },
                        beginAdd() {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.model.user_name = '';
                                this.model.user_pwd = '';
                                this.model.role_id = null;
                                this.mode = true;
                                this.isEdit = true;
                        },
                        formValidateHandler(prop, vaild, message) {
				if(prop === 'user_name') this.userNameValidateResult = vaild;
                        },
			async save() {
                                if(this.mode) {
                                        if(this.userNameValidateResult === false) return;
                                        if(typeof this.userNameValidateResult === "undefined") {
                                                await new Promise(resolve => this.$refs.form.validateField('user_name', message => {
                                                        if(message === '') resolve();
                                                }));
                                        }
                                }
                                await new Promise(resolve => this.$refs.form.validateField('user_pwd', message => {
                                        if(message === '') resolve();
                                }));
				// 代码能执行到这里说明用户名和密码都通过了验证，可以执行后续真正的新增与修改操作
                                if (this.mode) {
                                        let a = await this.$http({
                                                method: 'post',
                                                url: '/user/add',
                                                data: this.model
                                        });
                                        this.$message({message: '新增成功', type: 'success'});
                                        this.user.push(Object.assign({}, this.model));
                                        this.pagination.total++;
                                } else {
                                        await this.$http({
                                                method: 'post',
                                                url: '/user/change_pwd',
                                                data: this.model,
                                        });
                                        let index = this.user.findIndex(item => item.user_name === this.model.user_name);
                                        this.user.splice(index, 1, Object.assign({}, this.model));
                                }
                                this.isEdit = false;
			},
			remove(index) {
                                this.$confirm(`确认删除 ${this.user[index].user_name} 用户`, '提示', {
                                        type: 'warning'
                                })
	                                .then(async () => {
                                                this.model.user_name = this.user[index].user_name;
                                                await this.$http({
                                                        url: '/user/remove/' + this.model.user_name,
                                                        method: 'post',
                                                });
                                                // let i = this.user.findIndex(item => item.user_name === this.editUser.user_name);
                                                this.user.splice(index, 1);
                                                this.total--;
                                                this.$message({
                                                        type: 'success',
                                                        message: `${this.model.user_name}用户删除成功`
                                                })
	                                })
                                        .catch(() => {});
			},
                        beginFuncConfig(index) {
                                this.model.role_id = this.user[index].role_id || null;
                                this.model.user_name = this.user[index].user_name;
                                this.model.user_pwd = this.user[index].user_pwd;
                        },
			async saveRole(index) {
                                if (this.model.role_id !== null) {
                                        this.model.role_name = this.list.find(item => item.role_id === this.model.role_id).role_name;
                                }
                                if(typeof this.model.role_name === undefined) this.model.role_name = '';
				await this.$http({
					url: '/user/config_role',
					method: 'post',
					data: this.model
				});
                                this.user.splice(index, 1, Object.assign({}, this.model));
			},
		},
		watch: {
	                isEdit(newValue) {
				if(newValue === false) delete this.userNameValidateResult;
	                }
		}
        }
</script>

<style scoped type="text/stylus" lang="stylus">
	.el-container {
		position absolute
		top 0
		left 0
		width 100%
		height 100%

	}
</style>