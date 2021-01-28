export default {
        namespaced: true,
        state: {
                dictionaryList: [],
                isInit: false
        },
        mutations: {
                _init(state, list) {
                        state.dictionaryList = list;
                        state.isInit = true;
                },
        },
        actions: {
                async initDictionary({state, commit, rootState}) {
                        if(state.isInit) return;
                        let list = await rootState.http({ url: '/dictionary/all' });
                        commit('_init', list);
                }
        },
        getters:{
                getGroupByKey(state) {
                        return function(groupKey) {
                                return state.dictionaryList.filter(item => item.dic_group_key === groupKey);
                        }
                }
        },
}