<template>
	<el-container>
		<el-header height="40px">
			<el-form :inline="true">
				<el-form-item label="内容查找">
					<el-input placeholder="请输入查找内容" v-model="modelAll.stf_name"><i slot="prefix" class="el-input__icon el-icon-search" @click="getSize"></i></el-input>
				</el-form-item>
				<el-form-item label="教师类型查找"  v-model="edit.model.stf_category">
					<el-select v-model="modelAll.stf_category" @change="getSize">
						<el-option :label="'- 全部 -'" :value="0"></el-option>
						<el-option
							v-for="item in getGroupByKey('staff_category')"
							:label="item.dic_name"
							:key="item.dic_id"
							:value="item.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-button type="success" icon="el-icon-plus" @click="beginAdd" class="addStaff">添加</el-button>
			</el-form>
		</el-header>

		<el-main>
			<el-table :data="staffList" stripe style="width: 100%;height: 100%" height="100%" border>
				<el-table-column label="#" type="index"  width="50" align="center"></el-table-column>
				<el-table-column label="姓名" width="100" prop="stf_name"></el-table-column>
				<el-table-column label="教务类型" width="100" prop="stf_category">
					<template slot-scope="{ row }">
						<span v-text="getGroupByKey('staff_category').find(item => item.dic_id === row.stf_category).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="备注">
					<template slot-scope="{row}">
						<span v-if="staffList.length > 0 && row.stf_remark !== '' " v-text="row.stf_remark"></span>
						<span v-else class="grey">暂无相关备注</span>
					</template>
				</el-table-column>
				<el-table-column label="员工状态" width="100">
					<template slot-scope="{row}">
						<span v-text="row.stf_invalid === 1? '在职': '离职'" :class="{ redStaff:row.stf_invalid === 0   }"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作"  width="300">
					<template slot-scope="{row}">
						<el-button size="mini" type="primary" @click="beginEdit(row)">编辑</el-button>
						<el-button size="mini" type="danger" @click=""  v-show="row.stf_invalid === 1" @click="dimission(row)">离职</el-button>
						<el-button size="mini" type="warning" @click=""  v-show="row.stf_invalid === 0" @click="reinstate(row)">复职</el-button>
					</template>

				</el-table-column>
			</el-table>
		</el-main>

		<el-footer>
			<el-pagination background
			               layout="prev, pager, next,jumper,->,sizes,total"
			               :total="staffTotal"
			               @current-change="getPage"
			               :page-size.sync="modelAll.pageSize"
			               :page-sizes="[5,7,9,11,13]"
			               @size-change="getSize"
			></el-pagination>
		</el-footer>
		<el-dialog :modal="false" :title="edit.isEdit===true? '新增员工信息': '编辑员工信息'"  :visible.sync="edit.isDialog"  width="400px">
			<el-form ref="form" :rules="rules" :model="edit.model">
				<el-form-item label="员工名字" prop="stf_name">
					<el-input clearable v-model.trim="edit.model.stf_name"></el-input>
				</el-form-item>
				<el-form-item label="员工类型" prop="stf_category">
					<el-select v-model="edit.model.stf_category" placeholder=" - 请选择 - ">
						<el-option
							v-for="item in getGroupByKey('staff_category')"
							:label="item.dic_name"
							:key="item.dic_id"
							:value="item.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 4}"
						placeholder="请添加员工备注"
						v-model="edit.model.stf_remark">
					</el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				    <el-button type="primary"  v-text="edit.isEdit === true? '确定':'保存'" @click="save"></el-button>
				    <el-button @click="edit.isDialog = false">取 消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from "vuex";
	let { mapState:mapStateFromDictionary,mapGetters:mapGettersFromDictionary } = createNamespacedHelpers("dictionary");
        let { mapState:mapStateFromStaff,mapActions:mapActionsFromStaff } = createNamespacedHelpers("staff");
        export default {
                name: "staff",
	        data(){
                        return {
                                modelAll:{//获取数据时用
                                        stf_category: 0,//职务类型
	                                stf_name: "",
	                                begin: 0,
	                                pageSize: 5
                                },
                                edit:{//新增编辑时用
					isEdit: true,//新增还是编辑
	                                isDialog: false,//弹层是否关闭
	                                model: {
                                                stf_name: "",
                                                stf_category: null,
                                                stf_remark: "",
                                                stf_id: 0,
	                                }
                                },
	                        rules: {
                                        stf_name: [
	                                        {required: true, message: '* 请输入姓名', trigger: 'blur'}
                                        ],
                                        stf_category: [
                                                {required: true, message: '* 请选择员工类别', trigger: 'change'}
                                        ]
	                        }
                        }
	        },
	        computed:{
		        ...mapStateFromDictionary(["dictionary"]),
		        ...mapGettersFromDictionary(["getGroupByKey"]),
		        ...mapStateFromStaff(["staffList", "staffTotal"]),//初始渲染
	        },
	        methods:{
		        ...mapActionsFromStaff(["isGetStaff", "addStaff", "updateStaff", "dimissionRow", "reinstateRow"]),
                        getPage(page){//改变页数
                                this.modelAll.begin = (page - 1) * this.modelAll.pageSize;
                                this.isGetStaff(Object.assign({}, this.modelAll));
                        },
                        getSize(){//改变条数
                                this.modelAll.begin = 0;
                                this.isGetStaff(Object.assign({}, this.modelAll));
                        },
		        beginAdd(){//开始新增
                                this.$refs.form && this.$refs.form.resetFields();
				this.edit.isEdit = true;
				this.edit.model.stf_name = "";
                                this.edit.model.stf_category = null;
                                this.edit.model.stf_remark = "";
			        this.edit.isDialog = true;
		        },
		        beginEdit(node){//开始编辑
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.isEdit = false;
                                this.edit.model.stf_name = node.stf_name;
                                this.edit.model.stf_category = node.stf_category || 0;
                                this.edit.model.stf_remark = node.stf_remark;
                                this.edit.model.stf_id = node.stf_id;
                                this.edit.isDialog = true;
		        },
		        save(){//保存
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.isEdit){
                                                await this.addStaff(Object.assign({},this.edit.model));
                                                this.$message({ message:"添加成功",type:"success" })
                                        }else{
                                                await this.updateStaff(Object.assign({}, this.edit.model))
                                                this.$message({ message:"修改成功",type:"success" })
                                        }
                                        this.edit.isDialog = false;
                                });
		        },
		        async dimission(row){//离职
                                await this.dimissionRow(row);
                                this.$message({ message:"该员工已离职", type:"success" });
		        },
		        async reinstate(row){//复职
                                await this.reinstateRow(row);
                                this.$message({ message:"该员工已复职", type:"success" });
		        },
	        },
	        created(){
		        this.isGetStaff(Object.assign({}, this.modelAll));
	        }
        }
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		width 100%
		height 100%
		.addStaff
			float right
	.el-main
		.redStaff
			color: #ff0000
		.grey
			color #999
</style>