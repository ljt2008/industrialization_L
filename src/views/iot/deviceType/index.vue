<template>
  <UView name="设备类型"  urlAuth>
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="类型名称" />
        <USelectItem field="alias" label="类型别名" url="/iot/deviceType/alias" />
        <UButton func="query" url="/iot/deviceType/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/deviceType/add">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="设备类型管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="类型名称" />
        <UTreeSelectItem field="pid" label="父类型" :defaultValue="0"
           url="/iot/deviceType/tree" labelField="name" valueField="id"/>
        <USelectItem field="alias" label="类型别名" url="/iot/deviceType/alias" />
        <UInputItem field="remark" label="类型说明" />
      </template>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" :url="model.id ? '/iot/deviceType/edit' : '/iot/deviceType/add'">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns">
      <template #action="{record}">
        <UFuncTag func="edit" :data="record" url="/iot/deviceType/edit">修改</UFuncTag>
        <UFuncTag func="del" :data="record" url="/iot/deviceType/del">删除</UFuncTag>
      </template>
    </UViewTable>
  </UView>
</template>
<!-- 设备类型功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "DeviceType",
  setup() {
    let columns = ref([
      {field: "name", title: "类型名称", align: 'left', width: 250},
      {field: 'alias', title: '类型别名', width: 120, url: '/iot/deviceType/alias'},
      {field: "remark", title: "类型说明"},
      {field: 'action', title: '操作', type: 'action'},
    ]);

    let rules = reactive({
        pid: {required: true, message: '父类型必填'},
        name: {required: true, message: '类型名称必填'}
    })

    let editModel = ref({});
    let searchModel = ref({});
    return {columns, rules, editModel, searchModel}
  },
}
</script>
<style scoped> </style>
