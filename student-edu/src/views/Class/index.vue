<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="班级名称">
					<el-input prefix-icon="el-icon-search" clearable placeholder="请输入搜索内容" @blur="getList" v-model="model.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业">
					<el-select v-model="model.cls_dic_id_major" @change="getList">
						<el-option :value="0" label=" - 全部 - "></el-option>
						<el-option
							v-for="item in getGroupByKey('class_major')"
							:label="item.dic_name"
							:value="item.dic_id"
							:key="item.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级状态">
					<el-select v-model="model.cls_status" @change="getList">
						<el-option :value="0" label=" - 全部 - "></el-option>
						<el-option :value="1" label="开课中"></el-option>
						<el-option :value="2" label="未开课"></el-option>
						<el-option :value="3" label="结课"></el-option>
					</el-select>
				</el-form-item>
				<el-button type="success" @click="beginAdd" class="addClass" size="small"><i class="el-icon-plus"> 新增</i></el-button>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="list" stripe border>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column label="班级名称" width="120">
					<template slot-scope="{row}">
						<span v-text="row.cls_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="班级专业" width="120">
					<template slot-scope="{row}">
						<span v-text="getGroupByKey('class_major').find(item => item.dic_id === row.cls_dic_id_major).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教学老师" width="120">
					<template slot-scope="{row}">
						<span v-text="teacher.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教务老师" width="120">
					<template slot-scope="{row}">
						<span v-text="adminTeacher.find(item => item.stf_id === row.cls_stf_id_admin).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="就业老师" width="120">
					<template slot-scope="{row}">
						<span v-text="jobTeacher.find(item => item.stf_id === row.cls_stf_id_job).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教室" width="120">
					<template slot-scope="{row}">
						<span v-text="row.cls_clsr_id !== null? classroomList.find(item => row.cls_clsr_id === item.clsr_id).clsr_name: ''"></span>
					</template>
				</el-table-column>
				<el-table-column label="开课时间" width="120">
					<template slot-scope="{row}">
						<span v-text="row.cls_begin"></span>
					</template>
				</el-table-column>
				<el-table-column label="结课时间" width="120">
					<template slot-scope="{row}">
						<span v-text="row.cls_end"></span>
					</template>
				</el-table-column>
				<el-table-column label="班级状态" width="120">
					<template slot-scope="{row}">
						<span v-if="row.cls_begin === null" class="readyClass">未开课</span>
						<span v-else-if="row.cls_end === null && row.cls_begin !== null" class="openClass">开课ing</span>
						<span v-else class="endClass">结课</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="200">
					<template slot-scope="{row}">
						<span v-text="row.cls_remark"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="180" fixed="right">
					<template slot-scope="{row}">
						<el-button type="primary" size="mini" @click="beginUpdate(row)"><i class="el-icon-edit"></i> 修改</el-button>
						<el-button type="success" size="mini" v-if="row.cls_begin === null" @click="beginOpen(row)">开课</el-button>
						<el-button type="danger" size="mini" v-else-if="row.cls_end === null && row.cls_begin !== null" @click="endClass(row)">结课</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination background
			               layout="prev, pager, next,jumper,->,sizes,total"
			               :total="total"
			               :page-sizes="[5,7,9,11,13]"
			               @current-change="getList(false)"
			               @size-change="getList"
			               :page-size.sync="pagination.pageSize"
			               :current-page.sync="pagination.currentPage"
			></el-pagination>
		</el-footer>

		<el-dialog :modal="false" :title="edit.mode===true? '班级维护 - 新增': '班级维护 - 编辑'" :visible="edit.isEdit" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form label-width="100px" :rules="rules" ref="form1" :model="edit.editClass">
				<el-form-item label="班级名称：" prop="cls_name">
					<el-input placeholder="请输入班级名称" v-model.trim="edit.editClass.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：" prop="cls_dic_id_major">
					<el-select placeholder="- 请选择 -" v-model="edit.editClass.cls_dic_id_major">
						<el-option
							v-for="item in getGroupByKey('class_major')"
							:label="item.dic_name"
							:value="item.dic_id"
							:key="item.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教室：" v-if="edit.editClass.cls_clsr_id !== null">
					<el-select v-model="edit.editClass.cls_clsr_id" placeholder="- 请选择教室 -">
						<el-option
							v-for="item in classroomList"
							:key="item.clsr_id"
							:value="item.clsr_id"
							:label="item.clsr_name"
							:disabled="item.clsr_occupy === 1">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师：" prop="cls_stf_id_teacher">
					<el-select placeholder="- 请选择 -" v-model="edit.editClass.cls_stf_id_teacher">
						<el-option
							v-for="item in teacher"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师：" prop="cls_stf_id_admin">
					<el-select placeholder="- 请选择 -" v-model="edit.editClass.cls_stf_id_admin">
						<el-option
							v-for="item in adminTeacher"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师：" prop="cls_stf_id_job">
					<el-select placeholder="- 请选择 -" v-model="edit.editClass.cls_stf_id_job">
						<el-option
							v-for="item in jobTeacher"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：">
					<el-input type="textarea" placeholder="请输入内容" v-model="edit.editClass.cls_remark" maxlength="255" show-word-limit size="medium" :rows="5"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog title="开班" :modal="false" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :visible="isOpen">
			<el-form :rules="rules" ref="form2" :model="edit.editClass">
				<el-form-item label="教室"  prop="cls_clsr_id">
					<el-select v-model="edit.editClass.cls_clsr_id" placeholder="- 请选择教室 -">
						<el-option
							v-for="item in classroomList"
							:key="item.clsr_id"
							:value="item.clsr_id"
							:label="item.clsr_name"
							:disabled="item.clsr_occupy === 1">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="openClass">确定</el-button>
				<el-button @click="isOpen = false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
	let {mapState: stateFromClass, mapActions: actionsFromClass} = createNamespacedHelpers('classes');
        let { mapState: StateFromDictionary,mapGetters: GettersFromDictionary } = createNamespacedHelpers("dictionary");
        let {mapState: stateFromClassroom, mapActions: actionsFromClassroom, mapMutations: mutationsClassroom} = createNamespacedHelpers('classroom');

        export default {
                name: 'Class',
	        data() {
                        return {
                                isOpen: false,                          //是否开班
                                list: [],
	                        total: 0,
	                        teacher: [],                            // 教学老师
	                        adminTeacher: [],                 // 教务老师
	                        jobTeacher: [],                      // 就业老师
				model: {
                                        cls_name: '',
                                        cls_dic_id_major: 0,       // 班级类型
                                        cls_status: 0,                  // 班级状态
				},
                                pagination: {
                                        total: 0,
                                        pageSize: 5,
                                        currentPage: 1,
                                },
	                        edit: {
				        isEdit: false,
		                        mode: true,
		                        oldClassroom: null,
		                        editClass: {
                                                cls_id: 0,
                                                cls_name: '',
                                                cls_dic_id_major: null,            // 班级类型
                                                cls_clsr_id: null,
                                                cls_stf_id_teacher: null,
                                                cls_stf_id_admin: null,
                                                cls_stf_id_job: null,
                                                cls_begin: null,
                                                cls_end: null,
                                                cls_remark: ''
		                        }
	                        },
	                        rules: {
                                        cls_name: [
	                                        {
                                                        validator: async (rule, value, callback) => {
                                                                if(value === '')
                                                                        callback(new Error('* 班级名称不能为空'));
                                                                else if(this.edit.mode? await this.$http({method: 'post', url: '/class/valid_name', data: {cls_name: value}}): false)
                                                                        callback(new Error('* 班级名称已重复'));
                                                                else
                                                                        callback();
                                                        },
                                                        trigger: 'blur'
	                                        }
                                        ],
                                        cls_dic_id_major: [{required: true, message: '请选择班级专业', trigger: 'change'}],
                                        cls_stf_id_teacher: [{required: true, message: '请选择教学老师', trigger: 'change'}],
                                        cls_stf_id_admin: [{required: true, message: '请选择教务老师', trigger: 'change'}],
                                        cls_stf_id_job: [{required: true, message: '请选择就业老师', trigger: 'change'}],
                                        cls_clsr_id: [
	                                        {required: true, message: '请选择教室', trigger: 'change'}
                                        ]
	                        },
                        }
	        },
	        computed: {
                        ...stateFromClass(['classList', 'classTotal']),
		        ...stateFromClassroom({'classroomList': 'list'}),
		        ...GettersFromDictionary(['getGroupByKey']),
	        },
	        methods: {
                        ...actionsFromClass(['classInit', 'addClass', 'updateClass']),
		        ...actionsFromClassroom({'classroomInit': 'init', 'changeClassroomState': 'changeState', 'replaceClassroom': 'replaceClassroom'}),
		        async getList(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                let result = await this.$http({
                                        url: '/class/list',
                                        method: 'post',
                                        data: {
                                                ...this.model,
	                                        begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                                pageSize: this.pagination.pageSize,
                                        }
                                });
                                this.list = result.list;
                                this.total = result.total;
		        },
		        beginAdd() {
                                this.$refs.form1 && this.$refs.form1.resetFields();
                                this.edit.editClass.cls_id = 0;
			        this.edit.editClass.cls_name = '';
			        this.edit.editClass.cls_dic_id_major = null;
                                this.edit.editClass.cls_clsr_id = null;
                                this.edit.editClass.cls_stf_id_teacher = null;
                                this.edit.editClass.cls_stf_id_admin = null;
                                this.edit.editClass.cls_stf_id_job = null;
                                this.edit.editClass.cls_begin = null;
                                this.edit.editClass.cls_end = null;
                                this.edit.editClass.cls_remark = '';
                                this.edit.mode = true;
                                this.edit.isEdit = true;
		        },
		        beginUpdate(node) {
                                this.$refs.form1 && this.$refs.form1.resetFields();
                                this.edit.editClass.cls_id = node.cls_id;
                                this.edit.editClass.cls_name = node.cls_name;
                                this.edit.editClass.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.editClass.cls_clsr_id = node.cls_clsr_id;
                                this.edit.editClass.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.editClass.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.editClass.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.editClass.cls_begin = node.cls_begin;
                                this.edit.editClass.cls_end = node.cls_end;
                                this.edit.editClass.cls_remark = node.cls_remark;
                                this.edit.oldClassroom = node.cls_clsr_id;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
		        },
		        save() {
                                this.$refs.form1.validate(async valid => {
                                        if (!valid) return;
                                        if (this.edit.mode) {
                                                let result = await this.$http({
                                                        url: '/class/add',
                                                        method: 'post',
                                                        data: this.edit.editClass
                                                });
                                                this.edit.editClass.cls_id = result;
                                                this.list.push(Object.assign({}, this.edit.editClass));
                                                this.addClass(Object.assign({}, this.edit.editClass));
                                        } else {
                                                await this.$http({
                                                        url: '/class/update',
                                                        method: 'post',
                                                        data: this.edit.editClass
                                                });
                                                let index = this.list.findIndex(item => item.cls_id === this.edit.editClass.cls_id);
                                                this.list.splice(index, 1, Object.assign({}, this.edit.editClass));
                                                this.changeClassroomState(this.edit.editClass.cls_clsr_id);
                                                this.replaceClassroom(this.edit.oldClassroom);
                                                this.updateClass(Object.assign({}, this.edit.editClass));
                                        }
                                        this.edit.isEdit = false;
                                });
		        },
		        beginOpen(node) {
                                this.$refs.form2 && this.$refs.form2.resetFields();
                                this.edit.editClass.cls_id = node.cls_id;
                                this.edit.editClass.cls_name = node.cls_name;
                                this.edit.editClass.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.editClass.cls_clsr_id = node.cls_clsr_id;
                                this.edit.editClass.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.editClass.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.editClass.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.editClass.cls_begin = node.cls_begin;
                                this.edit.editClass.cls_end = node.cls_end;
                                this.edit.editClass.cls_remark = node.cls_remark;
                                this.isOpen = true;
		        },
		        openClass() {
                                this.$refs.form2.validate(async valid => {
                                        if (!valid) return;
                                        let result = await this.$http({
                                                url: '/class/begin',
                                                method: 'post',
                                                data: {
                                                        cls_id: this.edit.editClass.cls_id,
                                                        cls_clsr_id:  this.edit.editClass.cls_clsr_id
                                                }
                                        });
                                        this.edit.editClass.cls_begin = result;
                                        let index = this.list.findIndex(item => item.cls_id === this.edit.editClass.cls_id);
                                        this.list.splice(index, 1, Object.assign({}, this.edit.editClass));
                                        this.changeClassroomState(this.edit.editClass.cls_clsr_id);
                                        this.isOpen = false;
                                });
		        },
                        async endClass(node) {
                                this.edit.editClass.cls_id = node.cls_id;
                                this.edit.editClass.cls_name = node.cls_name;
                                this.edit.editClass.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.editClass.cls_clsr_id = node.cls_clsr_id;
                                this.edit.editClass.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.editClass.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.editClass.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.editClass.cls_begin = node.cls_begin;
                                this.edit.editClass.cls_end = node.cls_end;
                                this.edit.editClass.cls_remark = node.cls_remark;

                                let result = await this.$http({
	                                url: '/class/end',
	                                method: 'post',
	                                data: {
                                                cls_id: this.edit.editClass.cls_id
	                                }
                                });
                                this.edit.editClass.cls_end = result;
                                let index = this.list.findIndex(item => item.cls_id === this.edit.editClass.cls_id);
                                this.changeClassroomState(this.edit.editClass.cls_clsr_id);
                                this.list.splice(index, 1, Object.assign({}, this.edit.editClass));
		        }
	        },
	        async created(){
                        let a = this.$http({ url: '/staff/listbycategory/4' });
                        let b = this.$http({ url: '/staff/listbycategory/5' });
                        let c = this.$http({ url: '/staff/listbycategory/6' });
                        Promise.all([a, b, c,])
	                        .then(([staffTeacher, staffAdmin, staffJob]) => {
	                                this.teacher = staffTeacher;
	                                this.adminTeacher = staffAdmin;
	                                this.jobTeacher = staffJob;
	                        })
	                        .catch((error) => console.log(error));
                        this.classInit();
                        this.classroomInit();
                        await this.getList();
                },
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		width 100%
		height 100%
	.readyClass {
		color rgb(230, 162, 60)
	}
	.openClass {
		color rgb(23, 212, 107)
	}
	.endClass {
		color rgb(204, 204, 204)
	}
	.el-header {
		position relative
	}
	.addClass {
		position absolute
		top 0
		right 2%
	}
</style>