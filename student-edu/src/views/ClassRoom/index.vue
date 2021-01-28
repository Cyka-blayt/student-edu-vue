<template>
	<div>
		<div class="showTip">
			未使用：<span class="use-show"></span>
			使用中：<span class="unuse-show"></span>
		</div>
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in list" :key="item.id">
				<el-card shadow="hover" class="use" :class="{unuse: item.clsr_occupy === 1}">
					<span v-text="item.clsr_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click.native="beginUpdate(item)"><i class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click.native="remove(item.clsr_id)"><i class="el-icon-delete"></i></el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card @click.native="beginAdd" shadow="hover">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible="isEdit" :title="mode? '班级管理 - 新增': '班级管理 - 修改'" :show-close="false" width="650px">
			<el-form>
				<el-form-item label-width="100px" label="班级名称：">
					<el-input v-model="model.clsr_name"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer">
				<el-button type="primary" @click.native="save">保存</el-button>
				<el-button @click.native="isEdit = false">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from 'vuex';
        import classroom from "../../store/classroom";
	let {mapState, mapActions} = createNamespacedHelpers('classroom');

        export default {
                name: 'ClassRoom',
	        data() {
                        return {
                                isEdit: false,
	                        mode: true,
	                        model: {
                                        clsr_id: 0,
		                        clsr_name: '',
		                        clsr_occupy: 0,
	                        },
                        };
	        },
	        methods: {
                        ...mapActions(['init', 'removeClassroom', 'addClassroom', 'updateClassroom']),
		        beginAdd() {
                                this.mode = true;
                                this.isEdit = true;
		        },
		        beginUpdate(node) {
                                this.model.clsr_id = node.clsr_id;
                                this.model.clsr_name = node.clsr_name;
                                this.mode = false;
                                this.isEdit = true;
		        },
			async save() {
			        if (this.mode) {
                                        await this.addClassroom(Object.assign({}, this.model));
			        } else {
					await this.updateClassroom(Object.assign({}, this.model));
			        }
                                this.model.clsr_name = '';
			        this.isEdit = false;
			},
		        async remove(clsr_id) {
                                this.$confirm(`确认删除`, '提示', {
                                        type: 'warning'
                                })
	                                .then(async () => {
                                                await this.removeClassroom(clsr_id);
	                                })

		        },
	        },
	        computed: {
                        ...mapState(['list']),
	        },
	        created(){
                        this.init();
                }
        };
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
	.el-col
		margin-top 30px
		.el-card
			text-align center
			padding 10% 0
			/*background-color aquamarine*/
			color #606266
			font-size 17px
			font-weight bold
			cursor pointer
			position: relative;
			&.use
				background-color coral
			&.unuse
				background-color aqua
			.button-wrapper
				/*width 100%*/
				position absolute
				bottom  0
				right  3%
	.showTip {
		display flex
		align-items center
	}
	.use-show {
		background-color coral
		width 15px
		height 15px
		display inline-block
		margin-right 10px
	}
	.unuse-show {
		background-color aqua
		width 15px
		height 15px
		display inline-block
	}
</style>