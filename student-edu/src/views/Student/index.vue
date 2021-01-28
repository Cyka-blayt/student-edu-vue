<template>
	<el-container>
		<el-header>
			<el-form :inline="true" class="form-header">
				<el-form-item label="学生名字：">
					<el-input placeholder="请输入搜索内容" prefix-icon="el-icon-search" v-model="stuQuery.stu_name" @blur="getList"></el-input>
				</el-form-item>
				<el-form-item label="所在班级：">
					<el-select v-model="stuQuery.stu_cls_id" @change="getList">
						<el-option :value="0" label=" - 全部 - "></el-option>
						<el-option :value="null" label=" - 无班级 - "></el-option>
						<el-option
							v-for="item in classroomList"
							:key="item.clsr_id"
							:value="item.clsr_id"
							:label="item.clsr_name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="学生学历：">
					<el-select v-model="stuQuery.stu_qualification" @change="getList">
						<el-option :value="0" label=" - 全部 - "></el-option>
						<el-option
							v-for="item in getGroupByKey('qualification')"
							:label="item.dic_name"
							:value="item.dic_id"
							:key="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item class="wrapper-button">
					<el-button type="primary" size="small" @click="beginAdd"><i class="el-icon-plus"> 新增</i></el-button>
					<el-button type="success" size="small" @click="beginMoreDisClass"><i class="el-icon-share"></i> 批量分班</el-button>
					<el-button type="danger" size="small"><i class="el-icon-download"></i> 导出学生信息</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table stripe border :data="stuList" style="width: 100%" @select="selectCheck" @select-all="selectAll">
				<el-table-column type="index" label="#" fixed="left" align="center" width="50"></el-table-column>
				<el-table-column type="selection" fixed="left" show-overflow-tooltip align="center" width="50"></el-table-column>
				<el-table-column label="学生姓名" width="100" fixed="left">
					<template slot-scope="{row}">
						<span v-text="row.stu_name"></span>
					</template>
				</el-table-column>
				<el-table-column width="120" label="班级">
					<template slot-scope="{row}">
						<span v-text="classList.length > 0? classList.find(item => item.cls_id === row.stu_cls_id).cls_name: ''" v-if="row.stu_cls_id !== null"></span>
						<span v-else class="no-class">无班级</span>
					</template>
				</el-table-column>
				<el-table-column label="存档照片" width="120" align="center">
					<template slot-scope="{row}">
						<el-popover
							placement="right"
							:title="row.stu_name"
							width="200"
							trigger="click">
							<el-image
								style="width: 200px; height: 250px"
								:src="row.stu_avatar? row.stu_avatar: '/img/default.png'"
								fit="cover"
								></el-image>
							<span slot="reference" class="preview">预览</span>
						</el-popover>

					</template>
				</el-table-column>
				<el-table-column label="性别" width="50" align="center">
					<template slot-scope="{row}">
						<span v-text="row.stu_sex === 0? '男': '女'"></span>
					</template>
				</el-table-column>
				<el-table-column label="联系电话" width="150" align="center">
					<template slot-scope="{row}">
						<span v-text="row.stu_phone"></span>
					</template>
				</el-table-column>
				<el-table-column label="联系电话（备用）" width="150" align="center">
					<template slot-scope="{row}">
						<span v-text="row.stu_phone2"></span>
					</template>
				</el-table-column>
				<el-table-column label="出生日期" width="120">
					<template slot-scope="{row}">
						<span v-text="row.stu_born"></span>
					</template>
				</el-table-column>
				<el-table-column label="学历" width="120">
					<template slot-scope="{row}">
						<span v-text="getGroupByKey('qualification').find(item => item.dic_id === row.stu_qualification).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="毕业院校" width="200">
					<template slot-scope="{row}">
						<span v-text="row.stu_school"></span>
					</template>
				</el-table-column>
				<el-table-column label="院校专业" width="150">
					<template slot-scope="{row}">
						<span v-text="row.stu_major"></span>
					</template>
				</el-table-column>
				<el-table-column label="家庭住址" width="280">
					<template slot-scope="{row}">
						<span v-text="row.stu_address"></span>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="200">
					<template slot-scope="{row}">
						<span v-text="row.stu_remark" v-if="row.stu_remark !== ''"></span>
						<span v-else class="no-class">暂无相关备注...</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="380" fixed="right">
					<template slot-scope="{row}">
						<el-button type="success" size="mini" @click="beginOneDisClass(row)"><i class="el-icon-share"></i> 分班</el-button>
						<el-button type="danger" size="mini" @click="beginUpload(row)"><i class="el-icon-picture-outline" ></i> 照片存档</el-button>
						<el-button type="primary" size="mini" @click="beginUpdate(row)"><i class="el-icon-edit"></i> 编辑</el-button>
						<el-button type="warning" size="mini"><i class="el-icon-delete"></i> 删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination background
			               layout="prev, pager, next,jumper,->,sizes,total"
			               :total="total"
			               :page-sizes="[5,7,9,11,13]"
			               :page-size.sync="pagination.pageSize"
			               :current-page.sync="pagination.currentPage"
			               @current-change="getList(false)"
			               @size-change="getList">
			</el-pagination>
		</el-footer>

<!--		编辑-->
		<el-dialog :visible="edit.isEdit" :modal="false" :title="edit.mode===true? '学生维护 - 新增': '学生维护 - 编辑'" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
			<el-form label-width="120px" :rules="rules" ref="form1" :model="edit.editStu">
				<el-form-item label="学生姓名：" prop="stu_name">
					<el-input v-model.trim="edit.editStu.stu_name" placeholder="请输入学生姓名"></el-input>
				</el-form-item>
				<el-form-item label="性别：">
					<el-radio v-model="edit.editStu.stu_sex" :label="0">男</el-radio>
					<el-radio v-model="edit.editStu.stu_sex" :label="1">女</el-radio>
				</el-form-item>
				<el-form-item label="联系电话：" prop="stu_phone">
					<el-input v-model.trim="edit.editStu.stu_phone" placeholder="请输入手机号" maxlength="11" show-word-limit></el-input>
				</el-form-item>
				<el-form-item label="备用电话：" prop="stu_phone2">
					<el-input v-model.trim="edit.editStu.stu_phone2" placeholder="请输入备用联系方式（手机号/座机号）">
						<template slot="append">例如：028-88888888</template>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：" prop="stu_born">
					<el-date-picker
						v-model="edit.editStu.stu_born"
						type="date"
						placeholder="选择日期"
						value-format="yyyy-MM-dd">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="学历：" prop="stu_qualification">
					<el-select v-model="edit.editStu.stu_qualification" placeholder="- 请选择学生学历 -">
						<el-option
							v-for="item in getGroupByKey('qualification')"
							:label="item.dic_name"
							:value="item.dic_id"
							:key="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在校/毕业院校：">
					<el-input v-model.trim="edit.editStu.stu_school" placeholder="请输入在读/毕业的院校(选填)"></el-input>
				</el-form-item>
				<el-form-item label="在校学习专业：">
					<el-input v-model.trim="edit.editStu.stu_major" placeholder="请输入在读专业(选填)"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址：" prop="stu_address">
					<el-input v-model="edit.editStu.stu_address" placeholder="请输入家庭地址"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：">
					<el-input type="textarea" :rows="5" placeholder="请输入学生备注..." v-model="edit.editStu.stu_remark"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
<!--		照片-->
		<el-dialog :visible="upload.isUpload" :modal="false" title="照片存档" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
			<div class="old-pic" v-if="upload.model.stu_avatar_old !== null">
				<span>个人照片：</span>
				<el-image
					style="width: 150px; height: 150px"
					:src="upload.model.stu_avatar_old"
					fit="cover">
				</el-image>
			</div>
			<div class="new-pic">
				<span>上传照片：</span>
				<el-upload
					list-type="picture-card"
					action="/student/avatarupload"
					:headers="uploadHeaders"
					name="avatar"
					accept=".jpg,.png"
					:before-upload="beforeAvatarUpload"
					:on-success="avatarUploadSuccess"
					:on-remove="avatarRemove"
					ref="upload">
					<i class="el-icon-plus"></i>
					<p slot="tip">只能选择后缀名为png、jpg格式并且大小不超过2MB</p>
				</el-upload>
			</div>
			<span slot="footer">
				<el-button type="primary" :disabled="upload.model.stu_avatar_new === ''" @click="avatarUpload" >保存</el-button>
				<el-button @click="upload.isUpload = false">取消</el-button>
			</span>
		</el-dialog>
<!--		分班-->
		<el-dialog title="分班" :visible="division.isDivision" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" :modal="false">
			<el-form>
				<el-form-item label="班级">
					<el-select v-model="division.classModel.stu_cls_id">
						<el-option label="- 无班级 -" :value="null"></el-option>
						<el-option
							v-for="item in classList"
							:key="item.cls_id"
							:value="item.cls_id"
							:label="item.cls_name"
							:disabled="item.cls_end !== null"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="disClass">确定</el-button>
				<el-button @click="division.isDivision = false">取消</el-button>
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
                name: 'Student',
		data() {
                        return {
                                stuList: [],
	                        // classList: [],
	                        total: 0,
	                        stuQuery: {
                                        stu_name: '',
                                        stu_cls_id: 0,
                                        stu_qualification: 0,   // 学历
	                        },
                                pagination: {
                                        pageSize: 5,
                                        currentPage: 1,
                                },
	                        edit:{
                                        isEdit: false,
		                        mode: true,
		                        editStu: {
                                                stu_id: 0,
                                                stu_name: '',
                                                stu_avatar: null,
                                                stu_cls_id: null,
                                                stu_sex: 0,
                                                stu_phone: '',
                                                stu_phone2: '',
                                                stu_born: '',
                                                stu_qualification: null,
                                                stu_school: '',
                                                stu_major: '',
                                                stu_address: '',
                                                stu_remark: ''
		                        },
	                        },
                                uploadHeaders: {Authorization: sessionStorage.getItem('token')},
	                        upload: {
                                        isUpload: false,
		                        model: {
                                                stu_id: 0,
                                                stu_avatar_old: null,
                                                stu_avatar_new: '',
		                        }
	                        },
                                division: {
                                        isDivision: false,
	                                isMore: false,          // true是多个，false单个学生
	                                classModel: {
                                                stu_id: null,
                                                stu_ids: [],
                                                stu_cls_id: null
	                                },
	                                ready: [],
                                },
	                        rules: {
                                        stu_name: [
	                                        {required: true, message: '* 请输入学生姓名', trigger: 'blur'},
	                                        {max: 20, message: '* 学生姓名不超过二十个字', trigger: 'blur'}
                                        ],
                                        stu_phone: [
	                                        {
                                                        validator: async (rule, value, callback) => {
                                                                if(value === '')
                                                                        callback(new Error('* 手机号不能为空'));
                                                                else if(/^1\d{10}$/.test(value) === false)
                                                                        callback(new Error('* 手机号格式错误'));
                                                                else
                                                                        callback();
                                                        },
                                                        trigger: 'blur'
	                                        },
                                        ],
                                        stu_phone2: [
                                                {
                                                        validator: (rule, value, callback) => {
                                                                if(value === '')
                                                                        callback(new Error('* 备用手机号不能为空'));
                                                                else if(/^1\d{10}$/.test(value) === false)
                                                                        callback(new Error('* 手机号格式错误'));
                                                                else if(value === this.edit.editStu.stu_phone)
                                                                        callback(new Error('* 备用手机号码不能与手机号码相同'));
                                                                else
                                                                        callback();
                                                        },
                                                        trigger: 'blur'
                                                },
                                        ],
                                        stu_born: [
	                                        {required: true, message: '* 请选择出生日期', trigger: 'blur'}
                                        ],
                                        stu_qualification: [
                                                {required: true, message: '* 请选择学历', trigger: 'change'}
                                        ],
                                        stu_address: [
                                                {required: true, message: '* 请输入家庭地址', trigger: 'blur'}
                                        ],
	                        },
                        }
		},
	        computed: {
                        ...stateFromClass(['classList']),
                        ...stateFromClassroom({'classroomList': 'list'}),
                        ...GettersFromDictionary(['getGroupByKey']),
	        },
	        methods: {
                        ...actionsFromClass(['classInit']),
                        ...actionsFromClassroom({'classroomInit': 'init', }),
                        async getList(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                let result = await this.$http({
                                        url: '/student/list',
                                        method: 'post',
                                        data: {
                                                ...this.stuQuery,
                                                begin: (this.pagination.currentPage - 1) * this.pagination.pageSize,
                                                pageSize: this.pagination.pageSize,
                                        }
                                });
                                console.log(result);
                                this.stuList = result.list;
                                this.total = result.total;
                        },
		        beginAdd() {
                                this.$refs.form1 && this.$refs.form1.resetFields();
                                this.edit.mode = true;
                                this.edit.editStu.stu_id = 0;
                                this.edit.editStu.stu_name = '';
                                this.edit.editStu.stu_avatar = null;
                                this.edit.editStu.stu_cls_id = null;
                                this.edit.editStu.stu_sex = 0;
                                this.edit.editStu.stu_phone = '';
                                this.edit.editStu.stu_phone2 = '';
                                this.edit.editStu.stu_born = '';
                                this.edit.editStu.stu_qualification = null;
                                this.edit.editStu.stu_school = '';
                                this.edit.editStu.stu_major = '';
                                this.edit.editStu.stu_address = '';
                                this.edit.editStu.stu_remark = '';
                                this.edit.isEdit = true;
		        },
		        beginUpdate(node) {
                                this.$refs.form1 && this.$refs.form1.resetFields();
                                this.edit.mode = false;
                                this.edit.editStu.stu_id = node.stu_id;
                                this.edit.editStu.stu_name = node.stu_name;
                                this.edit.editStu.stu_avatar = node.stu_avatar;
                                this.edit.editStu.stu_cls_id = node.stu_cls_id;
                                this.edit.editStu.stu_sex = node.stu_sex;
                                this.edit.editStu.stu_phone = node.stu_phone;
                                this.edit.editStu.stu_phone2 = node.stu_phone2;
                                this.edit.editStu.stu_born = node.stu_born;
                                this.edit.editStu.stu_qualification = node.stu_qualification;
                                this.edit.editStu.stu_school = node.stu_school;
                                this.edit.editStu.stu_major = node.stu_major;
                                this.edit.editStu.stu_address = node.stu_address;
                                this.edit.editStu.stu_remark = node.stu_remark;
                                this.edit.isEdit = true;
		        },
		        save() {
                                this.$refs.form1.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode) {
                                                let id = await this.$http({
                                                        url: '/student/add',
                                                        method: 'post',
                                                        data: this.edit.editStu,
                                                });
                                                this.edit.editStu.stu_id = id;
                                                this.stuList.push(Object.assign({}, this.edit.editStu));
                                                this.total++;
                                        } else {
                                                await this.$http({
                                                        url: '/student/update',
                                                        method: 'post',
                                                        data: this.edit.editStu,
                                                });
                                                let index = this.stuList.findIndex(item => item.stu_id === this.edit.editStu.stu_id);
                                                this.stuList.splice(index, 1, Object.assign({}, this.edit.editStu));
                                        }
                                        this.edit.isEdit = false;
                                });
		        },
		        beginOneDisClass(node) {
                                this.division.isMore = false;
                                this.division.classModel.stu_id = node.stu_id;
                                this.division.classModel.stu_ids = [];
                                this.division.classModel.stu_cls_id = node.stu_cls_id;
			        this.division.isDivision = true;
		        },
                        selectCheck(selection, row) {
                                this.division.ready = [];
                                selection.forEach(item => {
                                        this.division.ready.push(item.stu_id);
                                });
                        },
		        selectAll(selection) {
                                this.division.ready = [];
                                selection.forEach(item => {
                                        this.division.ready.push(item.stu_id)
                                });
		        },
		        beginMoreDisClass() {
                                this.division.isMore = true;
                                this.division.classModel.stu_id = null;
                                this.division.classModel.stu_cls_id = null;
                                this.division.isDivision = true;
		        },
		        async disClass() {
                                if(this.division.isMore) {
                                        this.division.classModel.stu_ids = this.division.ready;
                                        await this.$http({
                                                url: '/student/assignclass',
                                                method: 'post',
                                                data: this.division.classModel
                                        });
                                        this.division.classModel.stu_ids.forEach(id => {
                                                let index = this.stuList.findIndex(item => item.stu_id === id);
                                                this.stuList[index].stu_cls_id = this.division.classModel.stu_cls_id;
                                        })
                                } else {
                                        await this.$http({
                                                url: '/student/assignclass',
                                                method: 'post',
                                                data: this.division.classModel
                                        });
                                        let index = this.stuList.findIndex(item => item.stu_id === this.division.classModel.stu_id);
                                        this.stuList[index].stu_cls_id = this.division.classModel.stu_cls_id;
                                }

				this.division.isDivision = false;
		        },
                        beforeAvatarUpload(file) {
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG= file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
                        avatarUploadSuccess({status, data, message}, file, fileList) {
                                switch(status){
	                                case 200:
	                                        this.upload.model.stu_avatar_new = data;
	                                        if(fileList.length > 1) fileList.shift();
	                                        break;
	                                case 401:
	                                        break;
	                                case 404:
	                                case 199:
	                                case 500:
	                                        this.$message.error(message)
                                }
                        },
                        avatarRemove(file, fileList) {
                                this.upload.model.stu_avatar_new = '';
                        },
                        async avatarUpload() {
                                let result = await this.$http({
	                                method: 'post',
	                                url: '/student/avatarupdate',
	                                data: this.upload.model
                                });
                                let index = this.stuList.findIndex(item => item.stu_id === this.upload.model.stu_id);
                                this.stuList[index].stu_avatar = result;
                                this.$message.success('头像上传更新成功！');     // 提示用户上传成功
                                this.upload.isUpload = false;                                   // 关闭上传头像对话框
                                this.$refs.upload.clearFiles()                                  // 重置上传控件，为下一次上传做准备
                        },
		        beginUpload(node) {
				this.upload.model.stu_avatar_old = node.stu_avatar;
				this.upload.model.stu_id = node.stu_id;
				this.upload.isUpload = true;
		        }
	        },
	        async created(){
                        this.classroomInit();
		        this.classInit();
			this.getList();
                }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-container
		position absolute
		left 0
		top 0
		width 100%
		height 100%
	.form-header {
		position relative
		white-space nowrap
	}
	.no-class {
		color #b1b3b7
	}
	.old-pic {
		display flex
		align-items center
		margin-bottom 10px
	}
	.new-pic {
		display flex
		align-items center
	}
	.img-button {
		margin 0 auto
	}
	.preview {
		color #5692ff
		cursor pointer
	}
	.preview:hover {
		color #82bcff
	}
</style>