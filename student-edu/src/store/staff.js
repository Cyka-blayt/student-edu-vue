import http from "../utils/http.js"

export default {
        namespaced:true,
        state:{
                staffList:[],
                staffTotal:0,
        },
        mutations:{
                _isGetStaff(state,staffAll){
                        state.staffList = staffAll.list;
                        state.staffTotal = staffAll.total;
                },
                _addStaff(state,staff){
                        state.staffList.push(staff);
                        let i = state.staffList.findIndex(item => item.stf_id === staff.stf_id);
                        state.staffList[i].stf_invalid = 1;
                },
                _updateStaff(state,staff){
                        let i = state.staffList.findIndex(item => item.stf_id === staff.stf_id);
                        state.staffList[i].stf_invalid = staff.stf_invalid;
                        state.staffList.splice(i,1,staff);
                },
                _dimission(state,staff){
                        let i = state.staffList.findIndex(item => item.stf_id === staff.stf_id);
                        state.staffList[i].stf_invalid = 0;
                },
                _reinstate(state, staff){
                        let i = state.staffList.findIndex(item => item.stf_id === staff.stf_id);
                        state.staffList[i].stf_invalid = 1;
                },
        },
        actions:{
                async isGetStaff({ state,commit }, staff){
                        let staffAll = await http({url: "/staff/list",method:"post" ,data:staff});
                        commit("_isGetStaff", staffAll);
                },
                async addStaff({ commit }, staff){
                        staff.stf_id = await http({ method:"post",url:"/staff/add" ,data:staff });
                        commit("_addStaff", staff)
                },
                async updateStaff({ commit }, staff){
                        await http({ method:"post",url:"/staff/update" ,data:staff  });
                        commit("_updateStaff", staff)
                },
                async dimissionRow({ commit }, staff){
                        await http({ url:"/staff/dimission/" + staff.stf_id });
                        commit("_dimission", staff)
                },
                async reinstateRow({ commit }, staff){
                        await http({url:"/staff/reinstate/" + staff.stf_id });
                        commit("_reinstate", staff)
                },
        },

}