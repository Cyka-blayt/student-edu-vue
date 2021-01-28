import http from '../utils/http.js';

export default {
        namespaced: true,
        state: {
                classList: [],
                classTotal: 0,
                isInit: false,
        },
        mutations: {
                _init(state, list) {
                        state.classList = list;
                        state.isInit = true;
                },
                _addClass(state, model){
                        state.classList.push(model);
                },
                _updateClass(state, model) {
                        let index = state.classList.findIndex(item => item.cls_id === model.cls_id);
                        state.classList.splice(index, 1, model);
                }
        },
        actions: {
                async classInit({commit}) {
                        let list = await http({url: '/class/all',});
                        commit('_init', list);
                },
                addClass({commit}, model) {
                        commit('_addClass', model)
                },
                updateClass({commit}, model) {
                        commit('_updateClass', model)
                },
        },

}