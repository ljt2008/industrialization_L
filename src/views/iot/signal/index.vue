<template>
  <UView name="寄存器点位">
    <UViewModal title="寄存器点位管理" :span="[7, 14]" v-model="editModel" :rules="rules" @edit="edit">
      <template #default="{model}">
        <USelectItem field="modelId" label="所属型号" labelField="model" valueField="id"
        url="/iot/deviceModel/listByType?typeId={typeId}" extra="注：请先选择左测的设备类型"/>
        <UInputItem field="name" label="点位名称" />
        <UInputItem field="fieldName" label="字段名" />
        <URadioItem field="type" label="类型" :options="type" :defaultValue="1"/>
        <UInputItem v-if="model.type==1" field="address" label="点位地址" />
        <USelectItem v-if="model.type==1" field="fieldType" label="字段类型" dict="iot_field_type" />
        <URadioItem v-if="model.type==2" field="encode" :options="encode" label="报文编码"/>
        <UTextareaItem v-if="model.type==2" field="message" label="自定义报文"/>
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/signal/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <ARow :gutter="8">
      <ACol :md="8" :lg="6" :xxl="4" :xxxl="3">
        <ACard title="设备类型" class="u-border-radius">
          <UTree url="/iot/deviceType/tree" selectable blockNode showLine defaultExpandAll @select="selectType" />
        </ACard>
      </ACol>
      <ACol :md="16" :lg="18" :xxl="20" :xxxl="21">
        <UViewSearch v-model="searchModel">
          <URow col="search">
            <UInputItem field="name" label="点位名称" :allowClear="true"/>
            <UInputItem field="fieldName" label="字段名" :allowClear="true"/>
            <USelectItem field="modelId" label="设备型号" :allowClear="true" labelField="model" valueField="id"
                     url="/iot/deviceModel/listByType?typeId={typeId}"/>
            <UButton func="query" url="/iot/signal/view" ref="searchRef">搜索</UButton>
            <UButton func="reset">重置</UButton>
            <UButton func="add" url="/iot/signal/add" v-auth="'iot:signal:add'">新增</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="columns" :scroll="{x: 1000}">
          <template #action="{record}">
            <UFuncTag func="edit" :data="record" url="/iot/signal/edit" v-auth="'iot:signal:edit'">修改</UFuncTag>
            <UFuncTag func="del" :data="record" url="/iot/signal/del" v-auth="'iot:signal:del'">删除</UFuncTag>
          </template>
        </UViewTable>
      </ACol>
    </ARow>
  </UView>
</template>
<!-- 寄存器点位功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "Signal",
  setup() {
    let type = ref([
      {label: '点位', value: 1},
      {label: '自定义', value: 2},
    ]);
    let columns = ref([
          {field: "name", title: "点位名称", width: 150},
          {field: "address", title: "点位地址", width: 120},
          {field: "modelId", title: "所属型号", url: "/iot/deviceModel/listByType?typeId=-1"
            , valueField: 'id', labelField: 'model', width: 150},
          {field: "fieldName", title: "字段名称", width: 150},
          {field: "fieldType", title: "字段类型", dict: 'iot_field_type', width: 100},
          {field: "type", title: "点位类型", width: 90, options: type},
          {field: "encode", title: "报文编码", width: 90},
          {field: "message", title: "自定义报文", width: 280},
          {field: 'action', title: '操作', type: 'action', width: 160, fixed: 'right'},
      ]);
    // HEX, UTF8, ASCII
    let encode = ref([
      {label: 'HEX', value: 'HEX'},
      {label: 'UTF8', value: 'UTF8'},
      {label: 'ASCII', value: 'ASCII'},
    ])
    let rules = reactive({
        name: {required: true, message: '点位名称必填'},
        address: {required: true, message: '点位地址必填'},
        modelId: {required: true, message: '型号必填'},
        message: [{required: true, message: '报文必填'}],
        encode: [{required: true, message: '报文编码必填'}],
        fieldName: {required: true, message: '字段名称必填'},
        fieldType: {required: true, message: '字典类型必填'},
    })

    let editModel = ref({typeId: null});
    let searchModel = ref({typeId: null});
    return {columns, rules, editModel, searchModel, type, encode}
  },
  methods: {
    edit(editModel) {
      if(this.searchModel.typeId) {
        editModel.typeId = this.searchModel.typeId
      }
      if(!editModel.encode) {
        editModel.encode = "HEX"
      }
    },
    selectType(selectedKeys) {
      this.searchModel.typeId = selectedKeys[0]
      this.$refs['searchRef'].trigger();
    }
  }
}
</script>
<style scoped> </style>
