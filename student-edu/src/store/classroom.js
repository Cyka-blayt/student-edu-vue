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
                _removeClassroom(state, clsr_id) {
                        let index = state.list.findIndex(item => item.clsr_id === clsr_id);
                        state.list.splice(index, 1);
                },
                _addClassroom(state, model) {
                        state.list.push(model)
                },
                _updateClassroom(state, model) {
                        let index = state.list.findIndex(item => item.clsr_id === model.clsr_id);
                        state.list.splice(index, 1, model);
                },
                _changeState(state, id) {
                        let index = state.list.findIndex(item => item.clsr_id === id);
                        if(state.list[index].clsr_occupy === 1) {
                                state.list[index].clsr_occupy = 0
                        } else {
                                state.list[index].clsr_occupy = 1
                        }
                },
                _replaceClassroom(state, id) {
                        let index = state.list.findIndex(item => item.clsr_id === id);
                        state.list[index].clsr_occupy = 0;
                }
        },
        actions: {
                async init(context) {
                        if (context.state.isInit) return;
                        let list = await http({url: '/classroom/all'});
                        context.commit('_init', list);
                },
                async removeClassroom(context, clsr_id) {
                        await http({ url: '/classroom/remove/' + clsr_id });
                        context.commit('_removeClassroom', clsr_id);
                },
                async addClassroom(context, model) {
                        model.role_id = await http({
                                method: 'post',
                                url: '/classroom/add',
                                data: model,
                        });
                        context.commit('_addClassroom', model);
                },
                async updateClassroom(context, model) {
                        await http({
                                method: 'post',
                                url: '/classroom/update',
                                data: model,
                        });
                        context.commit('_updateClassroom', model);
                },
                changeState({commit}, id) {
                        commit('_changeState', id);
                },
                replaceClassroom({commit}, id){
                        commit('_replaceClassroom', id);
                }
        },
}