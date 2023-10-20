<template>
  <UView name="设备">
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="设备名称" />
        <UInputItem field="status" label="设备状态" />
        <UInputItem field="deviceSn" label="设备编号" />
        <UTreeSelectItem field="deviceTypeId" label="设备类型"
         url="/iot/deviceType/tree" labelField="name" valueField="id"/>
        <UButton func="query" url="/iot/device/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="设备管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="设备名称" />
        <UInputItem field="deviceSn" label="设备编号" />
        <UTreeSelectItem field="deviceTypeId" label="设备类型"
         url="/iot/deviceType/tree" labelField="name" valueField="id" />
        <UInputItem field="status" label="设备状态" defaultValue="offline"/>
        <UInputItem field="model" label="设备型号" />
        <UInputItem field="ip" label="设备ip" />
        <UInputNumberItem field="port" label="设备端口" />
      </template>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" :url="model.id ? '/iot/device/edit' : '/iot/device/add'">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns" :scroll="{x: 1230}">
      <template #status="{record, value}">
        <a-badge v-if="record.status=='online'" status="processing" :text="value" />
        <a-badge v-else status="warning" :text="value" />
      </template>
<!--      <template #action="{record}">-->
<!--        <UFuncTag func="edit" :data="record" url="/iot/device/edit">修改</UFuncTag>-->
<!--        <UFuncTag func="del" :data="record" url="/iot/device/del">删除</UFuncTag>-->
<!--      </template>-->
    </UViewTable>
  </UView>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "Device",
  setup() {
    let columns = ref([
      {field: "name", title: "设备名称", width: 180},
      {field: "deviceSn", title: "设备编号", width: 200},
      {field: "deviceTypeName", title: "设备类型", width: 120},
      {field: "modelName", title: "设备型号", width: 120},
      {field: "ip", title: "设备ip", width: 180},
      {field: "port", title: "设备端口", width: 80},
      {field: "createTime", title: "创建时间", type: 'date', width: 100, format: 'YYYY-MM-DD'},
      {field: "switchTime", title: "上/下线时间", type: 'date', width: 160},
      {field: "status", title: "设备状态", dict: 'iot_device_status', width: 80, fixed: 'right'},
      // {field: 'action', title: '操作', type: 'action' , width: 150, fixed: 'right'},
      ]);

    let rules = reactive({
        name: {required: true, message: '设备名称必填'},
        status: {required: true, message: '设备状态必填'},
        deviceSn: {required: true, message: '设备编号必填'},
        deviceTypeId: {required: true, message: '设备类型产品必填'},
    })

    let editModel = ref({});
    let searchModel = ref({});
    return {columns, rules, editModel, searchModel}
  },
}
</script>
<style scoped> </style>
