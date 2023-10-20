<template>
  <UView name="产品">
    <U2Col :gutter="8">
      <template #left>
        <ACard :bordered="false">
          <UTree url="/iot/productType/tree" selectable blockNode showLine defaultExpandAll @select="selectParent" />
        </ACard>
      </template>
      <template #right>
        <UViewSearch v-model="searchModel">
          <URow col="search">
            <UInputItem field="name" label="产品名称" :allowClear="true"/>
            <UButton func="query" url="/iot/product/view" ref="searchRef">搜索</UButton>
            <UButton func="reset">重置</UButton>
            <UButton func="add" url="/iot/product/add" v-auth="'iot:product:add'">新增</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="columns" :scroll="{x: 1200}">
          <template #action="{record}">
            <UTag func="edit" :data="record" url="/iot/product/edit" v-auth="'iot:product:edit'">修改</UTag>
            <UTag func="del" :data="record" url="/iot/product/del" v-auth="'iot:product:del'">删除</UTag>
          </template>
        </UViewTable>
      </template>
    </U2Col>

    <UViewModal title="产品管理" :span="[7, 14]" v-model="editModel" :rules="rules" @edit="editOpen">
      <template #default="{model}">
        <UInputItem field="name" label="产品名称" />
        <UTreeSelectItem field="productTypeId" label="所属类型" url="/iot/productType/tree" labelField="name" valueField="id" />
        <UInputItem field="code" label="产品代码" />
        <USelectItem field="gatewayId" label="所属网关" url="/iot/gateway/list" labelField="name" valueField="id"/>
        <USelectItem field="protocolId" label="所属协议" url="/iot/protocol/list" labelField="name" valueField="id" />
<!--        <UInputItem field="logo" label="logo地址" />-->
        <UInputItem field="remark" label="产品说明" />
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/product/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>

  </UView>
</template>
<!-- 产品功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "Product",
  setup() {
    let columns = ref([
      {field: "name", title: "产品名称"},
      // {field: "logo", title: "logo地址"},
      {field: "code", title: "产品代码"},
      {field: "gatewayName", title: "所属网关"},
      {field: "protocolName", title: "所属协议"},
      {field: "typeName", title: "产品类型"},
      {field: "remark", title: "产品说明", width: 320},
      {field: "createTime", title: "创建时间", type: 'date', format: 'YYYY-MM-DD', width: 130},
      {field: 'action', title: '操作', type: 'action', fixed: 'right', width: 180},
    ]);

    let rules = reactive({
      name: {required: true, message: '产品名称必填'},
      code: {required: true, message: '产品代码必填'},
      productTypeId: {required: true, message: '产品类型必填'},
      gatewayId: {required: true, message: '所属网关必填'},
      protocolId: {required: true, message: '所属协议必填'},
    })

    let editModel = ref({});
    let searchModel = ref({});
    return {columns, rules, editModel, searchModel}
  },
  methods: {
    editOpen(editModel) {
      if(!editModel['productTypeId']) {
        editModel['productTypeId'] = this.searchModel['productTypeId']
      }
    },
    selectParent(selectedKeys) {
      this.searchModel.productTypeId = selectedKeys[0];
      this.$refs['searchRef'].trigger();
    },
  }
}
</script>
<style scoped> </style>
