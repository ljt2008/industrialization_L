<template>
  <UView name="组织机构">
    <UViewSearch bread>
      <URow col="search">
        <UInputItem field="name" label="机构名称"/>
        <UInputItem field="phone" label="手机号"/>
        <UButton func="query" url="/core/org/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
      </URow>
    </UViewSearch>
    <UViewTable :columns="columns" :scroll="{x: 800}" :pagination="false">
      <template #func>
        <UButton func="add" v-auth="'core:org:add'">新增</UButton>
        <UButton func="expand">展开/缩收</UButton>
      </template>
      <template #c_action="{record}">
        <UFuncTag func="add:child" :data="record" v-auth="'core:org:add'" :config="{pid: 'pid'}">新增子机构</UFuncTag>
        <UFuncTag func="edit" :data="record" url="/core/org/edit" v-auth="'core:org:edit'">修改</UFuncTag>
        <UFuncTag func="del" :data="record" url="/core/org/del" v-auth="'core:org:del'">删除</UFuncTag>
      </template>
    </UViewTable>
    <UViewModal :span="[7, 15]" :rules="rules" title="机构管理">
      <UTreeSelectItem field="pid" label="上级机构" valueField="id"
           :defaultValue="0" url="/core/org/parent" labelField="name"
           treeNodeFilterProp="label"/>
      <UInputItem field="name" label="机构名称"/>
      <UInputItem field="leader" label="机构负责人"/>
      <UInputItem field="phone" label="负责人手机号"/>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" :url="model.id ? '/core/org/edit' : '/core/org/add'">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
  </UView>
</template>
<!--部门管理-->
<script>

import {reactive} from "vue";

export default {
  name: "Org",
  setup() {
    let columns = reactive([
      {field: 'name', title: '机构名称', align: 'left'},
      {field: 'leader', title: '机构负责人'},
      {field: 'phone', title: '负责人手机号'},
      {field: 'createTime', title: '创建时间'},
      {field: 'action', type:'action', title: '操作'},
    ])

    let rules = reactive({
      name: {required: true, message: '部门名称必填'},
      pid: {type: 'number', required: true, message: '请选择所属部门'},
    })

    return {columns, rules}
  }
}
</script>

<style scoped>

</style>
