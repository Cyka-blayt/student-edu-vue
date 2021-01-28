<template>
	<el-container class="page-container">
		<el-header>
			<h1>学生后台管理系统V 1.0</h1>
			<div class="user_name">
				<span v-text="user_name"></span>
				<span class="logout" @click="logout">退出</span>
			</div>
		</el-header>
		<el-container>
			<el-aside width="250px">
				<el-menu background-color="#303133" text-color="#fff" active-text-color="#ffd04b" :default-active="activeFuncKey" @select="menuSelectHandler" unique-opened>
<!--					template不会占用-->
					<template v-for="item in menuData">
						<el-submenu v-if="item.children" :index="item.func_id.toString()" :key="item.func_id">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children" :index="item2.func_key" :key="item2.func_id">
									<i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
						<el-menu-item v-else :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
					</template>
				</el-menu>
			</el-aside>
			<el-container>
				<el-main>
					<el-tabs type="card" closable v-model="activeFuncKey" @tab-remove="tabRemoveHandler">
						<!-- 需要绑定一个name  name很关键-->
						<el-tab-pane v-for="func_key in activeFuncKeys" :label="menu.find(item => item.func_key === func_key).func_name" :name="func_key" :key="func_key">
							<!-- 渲染指定的组件 用component 和is属性-->
							<component :is="views[func_key]"></component>
						</el-tab-pane>
					</el-tabs>
				</el-main>
				<el-footer>
					版权所有&copy;zzy&&hjh 网址：www.kengnimeifannao.com
				</el-footer>
			</el-container>
		</el-container>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
        import {createNamespacedHelpers} from 'vuex';
        let {mapState: mapStateFromDictionary, mapActions: mapActionsFromDictionary} =createNamespacedHelpers('dictionary');

	export default {
	        name: 'Home',
		data() {
	                return {
	                        activeFuncKey: '',
		                activeFuncKeys: [],
                                menu: [],
		                views,
                                user_name: sessionStorage.getItem('user_name'),
	                }
		},
		methods: {
                        ...mapActionsFromDictionary(['initDictionary']),
	                menuSelectHandler(index, indexPath) {
	                        // select 事件收到监听会回调两个结果index和indexPath 如果忘了console出来就懂了。
				this.activeFuncKey = index;
				if (this.activeFuncKeys.indexOf(index) === -1) {
				        this.activeFuncKeys.push(index);
				}
	                },
			tabRemoveHandler(name) {
				this.activeFuncKeys.splice(this.activeFuncKeys.indexOf(name), 1);
				if (this.activeFuncKeys.indexOf(this.activeFuncKey) === -1) {
				        this.activeFuncKey = this.activeFuncKeys[0] || '';
				}
			},
                        logout() {
                                this.$router.replace('/login')
                        },
		},
		computed: {
	                ...mapStateFromDictionary(['dictionaryList']),
	                menuData() {
	                        let result = [];
	                        this.menu.filter(item => item.func_fid === 0).forEach(item => {
	                                let node = Object.assign({}, item);
	                                let children = this.menu.filter(item2 => item2.func_fid === item.func_id);
					if (children.length > 0) {
					        node.children = [];
					        children.forEach(item2 => node.children.push(Object.assign({}, item2)));
					}
					result.push(node);
	                        });
	                        return result;
	                },
		},
		async created(){
                        this.initDictionary();
	                this.menu = await this.$http({
				url: '/user/getmenu',
		                method: 'post'
			});
                }
        }
</script>

<style scoped lang="stylus">
	.page-container
		height: 100%

	.el-header {
		background-color: #606266;
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.logout {
		font-size: 13px;
		cursor pointer
	}
	.logout:hover {
		color #b1b3b7
	}
	.el-aside {background-color: #303133; color: white}
	.el-menu {
		border-right: none
	}
	.el-main {
		position: relative;
	}
	.el-footer
		background-color #909399
		display flex
		align-items center
		color #cbcbcb
		font-size 14px
</style>