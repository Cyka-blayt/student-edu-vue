<template>
	<div>
		<el-row :gutter="20">
			<el-col v-for="item in list" :key="item.role_id" :span="6">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click.native="beginUpdate(item)"><i class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click.native="remove(item)"><i class="el-icon-delete"></i></el-button>
						<el-button type="text" @click.native="beginRoleFuncConfig(item.role_id)">功能分配</el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6" @click.native="beginAdd">
				<el-card shadow="hover" class="btn-add">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible="isEdit" :modal="false" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :title="mode? '角色管理 - 新增': '角色管理 - 编辑'" width="650px">
			<el-form label-width="120px" :rules="edit.rules" :model="edit.model" ref="form">
				<el-form-item label="角色名称：" prop="role_name">
					<el-input v-model.trim="edit.model.role_name" placeholder="- 请输入角色名称 -"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" @click.native="save">确定</el-button>
				<el-button @click="isEdit = false">取消</el-button>
			</div>
		</el-dialog>
		<el-drawer :visible.sync="edit2.isEdit" :show-close="false" :modal="false" class="custom-drawer" size="500px">
			<h3 slot="title">角色功能分配</h3>
			<el-tree class="custom-tree" :data="edit2.treeData" default-expand-all :expand-on-click-node="false">
				<span class="custom-tree-node" slot-scope="{node, data}" :class="{parent: data.func_key === ''}" >
					<span>
						<i class="el-icon-paperclip" v-if="data.func_key !== ''"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span class="switch-wrapper">
						<el-switch v-model="data.open" @change="switchChangeHandler(data)"></el-switch>
					</span>
				</span>
			</el-tree>
			<div class="drawer-footer">
				<el-button type="primary" @click="roleFuncConfig()">确定</el-button>
				<el-button @click="edit2.isEdit = false">取消</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
	let {mapActions: mapActionsFromRole, mapState: mapStateFromRole} = createNamespacedHelpers('role');
	let {mapGetters: mapGettersFromFunc, mapActions: mapActionsFromFunc} = createNamespacedHelpers('func');

        export default {
                name: 'Role',
	        data() {
                        return {
                                isEdit: false,
	                        mode: true,             // 默认新增
	                        edit: {
                                        model: {role_id: 0, role_name: ''},
                                        rules: {
                                                role_name: [
                                                        {
                                                                validator: (rule, value, callback) => {
                                                                        let {role_id, role_name} = this.edit.model;
                                                                        if (value.length === 0)
                                                                                callback(new Error('* 角色名称不能为空'));
                                                                        else if(value.length < 2 || value.length > 20)
                                                                                callback(new Error('* 角色名称长度 2-20'));
                                                                        else if(this.list.some(item => item.role_id !== role_id && item.role_name === role_name))
                                                                                callback(new Error('* 角色名称已重复'));
                                                                        else
                                                                                callback();
                                                                }
                                                        }
                                                ]
                                        },
	                        },
	                        edit2: {
                                        isEdit: false,           // 有没有进行角色功能分配
		                        model: {role_id: 0, role_func_ids: ''},
		                        treeData: [],
	                        },
                                roles: [],
                        }
	        },
	        computed: {
                            ...mapStateFromRole(['list']),
		            ...mapGettersFromFunc(['listToTree'])
	        },
	        async created() {
			await this.init();
			await this.initFunc();
                },
	        methods: {
                        ...mapActionsFromRole(['init', 'removeRole', 'addRole', 'updateRole']),
		        ...mapActionsFromFunc({'initFunc': 'init'}),
                        remove(node) {
                                this.$confirm(`确认删除 ${node.role_name} 角色`, '提示', {
                                        type: 'warning'
                                })
	                                .then(async () => {
						await this.removeRole(node.role_id);
                                                this.$message({
                                                        type: 'success',
                                                        message: `${node.role_name}已删除`
                                                })
	                                })
                        },
                        beginAdd() {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.mode = true;
                                this.isEdit = true;
                        },
		        beginUpdate(node) {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.mode = false;
                                this.edit.model.role_id = node.role_id;
                                this.edit.model.role_name = node.role_name;
                                this.isEdit = true;
		        },
		        save() {
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if (this.mode) {
                                                await this.addRole(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        type: 'success',
                                                        message: `已添加成功`
                                                })
                                        } else {
                                                await this.updateRole(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        type: 'success',
                                                        message: '已修改成功'
                                                })
                                        }
                                        this.isEdit = false;
                                });
		        },
                        async beginRoleFuncConfig(role_id) {
				let roleFuncs = await this.$http({url: '/role_function/list/' + role_id,});
				let roleFuncIds = roleFuncs.reduce((result, item) =>{
                                        result.push(item.func_id);
                                        return result;
				}, []);
				this.updateTreeData(roleFuncIds);
				this.edit2.model.role_func_ids = '';
				this.edit2.model.role_id = role_id;
                                this.edit2.isEdit = true;
                        },
                        switchChangeHandler(node) {
                                if (node.func_key === '') {             // 非叶子节点
                                        node.children && node.children.forEach(item => item.open = node.open);
                                } else {                                             // 叶子节点
                                        let parent = this.edit2.treeData.find(item => item.func_id === node.func_fid);
                                        console.log(parent)
                                        parent.open = parent.children.some(item => item.open);
                                }
                        },
		        updateTreeData(roleFuncIds) {
                                let result = JSON.parse(JSON.stringify(this.listToTree));
                                result.forEach(item => {
                                        item.open = roleFuncIds.indexOf(item.func_id) !== -1;
                                        item.children && item.children.forEach(item2 => item2.open = roleFuncIds.indexOf(item2.func_id) !== -1);
                                });
                                this.edit2.treeData = result;
		        },
                        async roleFuncConfig() {
                                // 发ajax前统计树中所有open的节点的func_id
				let func_ids = [];
				this.edit2.treeData.forEach(item => {
				        if( item.open) func_ids.push(item.func_id);
				        item.children && item.children.forEach(item2 => {
				                if(item2.open) func_ids.push(item2.func_id);
				        })
				});
				this.edit2.model.role_func_ids = func_ids.join(',');
	                        // 发ajax
                                await this.$http({
	                                method: 'post',
	                                url: 'role_function/config',
	                                data: this.edit2.model,
                                });
				// ajax成功返回后的相应界面变化
                                this.edit2.isEdit = false;
                                this.$message({message: '角色功能分配成功!', type: 'success'});
                        }
	        },
	        watch: {
		        listToTree() {
		                this.edit2.isEdit = false;
                                this.updateTreeData([]);
		        },
	        },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-col
		margin-top 30px
		.el-card
			text-align center
			padding 10% 0
			background-color aquamarine
			color #606266
			font-size 17px
			font-weight bold
			cursor pointer
			position: relative;
			&.btn-add
				box-sizing border-box
				background-color transparent
				border 2px dashed #0094ff
				color #0094ff
			.button-wrapper
				/*width 100%*/
				position absolute
				bottom  0
				right  3%
				/*transform translate(-50%, -50%)*/
				/*display none*/
				.el-button
					color #606266
					font-size 16px
	/*.el-card:hover .button-wrapper {
		display block
	} */
	.custom-tree
		width: 400px
		margin: 20px 0 50px 50px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items: center
			&.parent
				padding-right: 50px
				color: #0094ff
	.drawer-footer
		text-align: center
</style>