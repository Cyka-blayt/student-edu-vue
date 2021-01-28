import http from '../utils/http.js';

export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false,
        },
        mutations: {
                // 不对外的方法 起名开头最好是_开头
                _init(state, list) {
                        state.list = list;
                        state.isInit = true;
                },
                _removeFunc(state, func_id) {
                        let i = state.list.findIndex(item => item.func_id === func_id);
                        state.list.splice(i, 1);
                },
                _addFunc(state, model) {
                        state.list.push(model);
                },
                _updateFunc(state, model) {
                        let i = state.list.findIndex(item => item.func_id === model.func_id);
                        state.list.splice(i, 1, model);
                }
        },
        actions: {
                async init(context) {
                        if (context.state.isInit) return;
                        let list = await http({url: '/function/all',});
                        context.commit('_init', list)
                },
                async removeFunc(context, func_id){
                        await http({
                                url: '/function/remove/' + func_id,
                                method: 'post'
                        });
                        context.commit('_removeFunc', func_id);
                },
                async addFunc(context, model) {
                        model.func_id = await http({
                                method: 'post',
                                url: '/function/add',
                                data: model,
                        });
                        context.commit('_addFunc', model);
                },
                async updateFunc(context, model) {
                        await http({
                                method: 'post',
                                url: '/function/update',
                                data: model,
                        });
                        context.commit('_updateFunc', model);
                }
        },
        getters: {
                listToTree(state) {
                        let result = [];
                        let i = (node) => {
                                let chidren = state.list.filter( item => item.func_fid === node.func_id);
                                if (chidren.length > 0) {
                                        node.children = [];
                                        chidren.forEach(item => {
                                                let childNode = i(Object.assign(item));
                                                node.children.push(childNode);
                                        });
                                }
                                return node;
                        };
                        state.list.filter(item => item.func_fid === 0).forEach(item => {
                                let node = i(Object.assign(item));
                                result.push(node);
                        });
                        return result;
                }
        }
}