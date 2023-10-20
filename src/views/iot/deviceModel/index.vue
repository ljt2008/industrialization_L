<template>
  <UView name="设备型号">
    <UViewModal title="设备型号管理" :span="[7, 14]" v-model="editModel" :rules="rules" @edit="edit">
      <template #default="{model}">
        <UTreeSelectItem field="typeId" label="设备类型"
             url="/iot/deviceType/tree" labelField="name" valueField="id"/>
        <UInputItem field="model" label="设备型号" />
        <UInputItem field="remark" label="型号说明" />
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/deviceModel/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <ARow :gutter="8">
      <ACol span="6">
        <ACard title="设备类型" class="u-border-radius">
          <UTree url="/iot/deviceType/tree" selectable blockNode showLine defaultExpandAll @select="selectParent" />
        </ACard>
      </ACol>
      <ACol span="18">
        <UViewSearch v-model="searchModel">
          <URow col="search">
<!--            <UTreeSelectItem field="typeId" label="设备类型" :allowClear="true"-->
<!--                         url="/iot/deviceType/tree" labelField="name" valueField="id"/>-->
            <UInputItem field="model" label="设备型号" allowClear/>
            <UButton func="query" url="/iot/deviceModel/view" ref="searchRef">搜索</UButton>
            <UButton func="reset">重置</UButton>
            <UButton func="add" url="/iot/deviceModel/add" v-auth="'iot:deviceModel:add'">新增</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="columns">
          <template #action="{record}">
            <UFuncTag func="edit" :data="record" url="/iot/deviceModel/edit" v-auth="'iot:deviceModel:edit'">修改</UFuncTag>
            <UFuncTag func="del" :data="record" url="/iot/deviceModel/del" v-auth="'iot:deviceModel:del'">删除</UFuncTag>
          </template>
        </UViewTable>
      </ACol>
    </ARow>

  </UView>
</template>
<!-- 设备型号功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "DeviceModel",
  setup() {
    let columns = ref([
          {field: "typeName", title: "设备类型"},
          {field: "model", title: "型号"},
          {field: "remark", title: "型号说明"},
          {field: 'action', title: '操作', type: 'action'},
      ]);

    let rules = reactive({
      model: {required: true, message: '设备型号必填'},
      typeId: {required: true, message: '设备类型必填'},
    })

    let editModel = ref({});
    let searchModel = ref({typeId: null});
    return {columns, rules, editModel, searchModel}
  },
  methods: {
    edit(editModel) {
      if(this.searchModel.typeId) {
        editModel.typeId = this.searchModel.typeId;
      }
    },

    selectParent(selectedKeys) {
      this.searchModel.typeId = selectedKeys[0]
      this.$refs['searchRef'].trigger();
    }
  }
}
</script>
<style scoped> </style>
