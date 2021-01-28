import http from '../utils/http.js';

export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false,
        },
        mutations: {
                _init(state, list) {
                        state.list = list;
                        state.isInit = true;
                },
                _removeRole(state, role_id) {
                        let index = state.list.findIndex(item => item.role_id === role_id);
                        state.list.splice(index, 1);
                },
                _addRole(state, model) {
                        state.list.push(model)
                },
                _updateRole(state, model) {
                        let index = state.list.findIndex(item => item.role_id === model.role_id);
                        state.list.splice(index, 1, model);
                },
        },
        actions: {
                async init(context) {
                        if (context.state.isInit) return;
                        let list = await http({url: '/role/all'});
                        context.commit('_init', list);
                },
                async removeRole(context, role_id) {
                        await http({
                                method: 'post',
                                url: '/role/remove/' + role_id,
                        });
                        context.commit('_removeRole', role_id);
                },
                async addRole(context, model) {
                        model.role_id = await http({
                                method: 'post',
                                url: '/role/add',
                                data: model,
                        });
                        context.commit('_addRole', model);
                },
                async updateRole(context, model) {
                        await http({
                                method: 'post',
                                url: '/role/update',
                                data: model,
                        });
                        context.commit('_updateRole', model);
                }
        },
}