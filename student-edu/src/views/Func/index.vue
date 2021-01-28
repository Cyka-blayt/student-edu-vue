<template>
	<div>
		<el-tree :data="funcsData" default-expand-all class="custom-tree" :expand-on-click-node="false">
			<span slot-scope="{node, data}" class="custom-tree-node">
				<span v-text="data.func_name" :class="{root: data.func_id === 0, unleaf: data.func_key === '', leaf: data.func_key !== ''}"></span>
				<span>
					<el-button type="text" v-if="data.func_key === ''" @click="beginAdd(data)"><i class="el-icon-plus"></i></el-button>
					<el-button type="text" v-if="data.func_id !== 0" @click="beginUpdate(data)"><i class="el-icon-edit"></i></el-button>
					<!--!! 第一个感叹号将数组转为布尔类型取反 第二个转为正-->
					<el-button type="text" v-if="[0, 44, 45].indexOf(data.func_id) === -1" :disabled="!!data.children" @click="remove(data)"><i class="el-icon-delete"></i></el-button>
				</span>
			</span>
		</el-tree>

		<el-dialog :visible="edit.isEdit" :modal="false" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :title="edit.mode? '系统功能维护 - 新增': '系统功能维护 - 编辑'" width="650px">
			<el-form :model="edit.model" :rules="edit.rules" ref="form" label-width="150px">
				<el-form-item label="系统功能类型：">
					<el-radio v-model="edit.isLeaf" :label="false" :disabled="edit.model.func_fid !== 0 || !edit.mode">非叶子功能节点</el-radio>
					<el-radio v-model="edit.isLeaf" :label="true" :disabled="edit.model.func_fid !== 0 || !edit.mode">叶子功能节点</el-radio>
				</el-form-item>
				<el-form-item label="父级节点名称：">
					<el-select v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option
							v-for="item in selectData"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统功能名称：" class="func_name" prop="func_name">
					<el-input v-model.trim="edit.model.func_name"></el-input>
				</el-form-item>
				<el-form-item label="系统功能关联组件：" v-show="edit.isLeaf"  prop="func_key">
					<el-select v-model="edit.model.func_key" placeholder="- 请选择系统功能关联组件 -">
						<el-option
								v-for="item in Object.keys(views)"
								:key="item"
								:label="item"
								:value="item"
								:disabled="list.findIndex(func => func.func_key === item) !== -1">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="button">
					<el-button type="primary" @click="save">保存</el-button>
					<el-button  @click="edit.isEdit = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
        import views from '../../views';
        // 仓库数据映射
        import {createNamespacedHelpers} from 'vuex';
        let {mapState, mapGetters, mapActions} = createNamespacedHelpers('func');

        export default {
                name: 'Func',
	        data() {
                        return {
                                funcs: [],
				edit: {
                                        mode: true,                     // true表示新增 false表示修改编辑
                                        isEdit: false,                     // 是否进入编辑状态
					isLeaf: true,                    // 当前编辑的是否是叶子节点
					model: {func_id: 0, func_name: '', func_key: '', func_fid: -1},
					rules: {
                                                func_name: [
	                                                {
                                                                validator: (rule, value, callback) => {
                                                                        // es6解构赋值
                                                                        let {func_id, func_name, func_fid} = this.edit.model;
                                                                        if (value.length === 0) {
                                                                                callback(new Error('* 名称不能为空'));
                                                                        } else if (value.length < 2 || value.length > 50) {
                                                                                callback(new Error('* 名称长度 2 - 50'));
                                                                        } else if (this.list.some(item => item.func_id !== func_id && item.func_name === func_name && item.func_fid === func_fid)) {
                                                                                callback(new Error('* 名称已在当前父级存在'));
                                                                        } else {
										callback();
                                                                        }
                                                                },
		                                                trigger: 'blur',
	                                                }
                                                ],
						func_key: [
							{
							        validator: (rule, value, callback) => {
									if (this.edit.mode && value === '' && this.edit.isLeaf)
									        callback(new Error('* 功能名称不能为空'));
									else
										callback();
							        },
								trigger: 'blur',
							}
						],
					},
				},
	                        views,
                        }
	        },
                computed: {
                        funcsData() {
	                        return [
	                                {
	                                        func_id: 0,
		                                func_name: 'Root',
		                                func_key: ''
		                                ,func_fid: -1,
		                                children: this.listToTree,
		                                // children: this.$store.getters['func/listToTree']
	                                }
	                        ];
                        },
	                selectData() {
                                let result = [{label: 'Root', value: 0}];
				this.list.filter(item => item.func_key === '').forEach(item => {
					result.push({label: item.func_name, value: item.func_id});
				});
                                return result;
	                },
			...mapState(['list']),
	                ...mapGetters(["listToTree"]),
                },
	        created(){
                        // this.$store.dispatch('func/init');
		        this.init();
                },
		methods: {
                        ...mapActions(['init', 'removeFunc', 'addFunc', 'updateFunc']),
                        remove(node) {
                                this.$confirm(`确认删除 ${node.func_name} 节点`, '提示', {
                                        type: 'warning'
                                })
	                                .then(async () => {
	                                        // await this.$store.dispatch('func/removeFunc', node.func_id);
	                                        await this.removeFunc(node.func_id);
	                                        this.$message({
		                                        type: 'success',
		                                        message: `${node.func_name}节点已删除，请重新刷新页面，启用最新菜单`
	                                        })
	                                })
	                                .catch(() => {})
                        },
			beginAdd(parentNode) {
                                this.$refs.form && this.$refs.form.resetFields();               // 重置表单错误
                                // 对话框前的准备工作
				this.edit.mode = true;
                                this.edit.isLeaf  = parentNode.func_id !== 0;
                                this.edit.model.func_id = 0;
                                this.edit.model.func_name = '';
                                this.edit.model.func_key = '';
                                this.edit.model.func_fid = parentNode.func_id;
                                // 打开对话框
                                this.edit.isEdit = true;
			},
                        beginUpdate(node) {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.mode = false;
                                this.edit.isLeaf  = node.func_key !== '';
                                this.edit.model.func_id = node.func_id;
                                this.edit.model.func_name = node.func_name;
                                this.edit.model.func_key = node.func_key;
                                this.edit.model.func_fid = node.func_fid;
                                this.edit.isEdit = true;
                        },
			save() {
                                this.$refs.form.validate(async valid => {
                                        if (!valid) return;
                                        if (this.edit.mode) {
                                                // await this.$store.dispatch('func/addFunc', Object.assign({}, this.edit.model));
	                                        await this.addFunc(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        type: 'success',
                                                        message: `${this.edit.model.func_name}节点已添加，请重新刷新页面，启用最新菜单`
                                                })
                                        } else {
                                                // await this.$store.dispatch('func/updateFunc', Object.assign({}, this.edit.model));
	                                        await this.updateFunc(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        type: 'success',
                                                        message: `${this.edit.model.func_name}节点已修改，请重新刷新页面，启用最新菜单`
                                                })
                                        }
                                        this.edit.isEdit = false;
                                })

			},
		},
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.custom-tree
		width 500px
		span.custom-tree-node
			flex 1
			display flex
			justify-content space-between
			align-items center
			span.root
				color darkcyan !important
				font-weight bold
			span.unleaf
				color hotpink
			span.leaf
				color rgb(65, 230, 119)
	.func_name {
		/*display: flex;*/
		/*justify-content space-between*/
	}
	.func_name input {
		flex: 1;
	}
	.button {
		text-align: right;
	}

</style>