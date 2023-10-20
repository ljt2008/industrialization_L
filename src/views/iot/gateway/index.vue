<template>
  <UView name="协议网关">
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="网关名称" :allowClear="true"/>
        <USelectItem field="status" label="网关状态" :allowClear="true" :options="gatewayStatus"/>
        <USelectItem field="protocolType" label="传输协议" url="/iot/gateway/transportProtocol" />
        <URadioItem field="type" label="网关类型" :options="gatewayType"
                    defaultValue="server" optionType="button" buttonStyle="solid"/>
        <UButton func="query" url="/iot/gateway/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/gateway/add" v-auth="'iot:gateway:add'">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewDrawer title="协议网关管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="网关名称" />
        <URadioItem field="type" label="网关类型" :options="gatewayType" defaultValue="server" optionType="button" buttonStyle="solid"/>
        <USelectItem field="protocolType" label="传输协议" url="/iot/gateway/transportProtocol" />
        <USelectItem field="protocolId" label="应用协议" url="/iot/protocol/list?type={protocolType}"
                     v-model:source="protocolSource" labelField="name" valueField="id">
          <template #option="{value, label}">
            <div style="padding: 0px 0px 5px;">
              <span style="float: left">{{label}}</span>
              <span style="float: right">{{protocolSource[value] ? protocolSource[value]['implModeName'] : '-'}}</span>
            </div>
          </template>
        </USelectItem>
        <UInputItem field="host" label="网关主机" />
        <UInputNumberItem field="port" label="网关端口" min="1" max="65535"/>
<!--        <URadioItem field="useSsl" label="是否启用ssl" :options="sslStatus" />-->
        <UInputItem field="username" label="用户名" />
        <UInputItem field="password" label="密码" />
<!--        <UInputNumberItem field="allIdle" label="读写空闲" :defaultValue="0"/>-->
<!--        <UInputNumberItem field="readIdle" label="读空闲" :defaultValue="0"/>-->
<!--        <UInputNumberItem field="writeIdle" label="写空闲" :defaultValue="0"/>-->
        <UTextareaItem field="remark" label="备注" />
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/gateway/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewDrawer>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #action="{record}">
        <UTag func="edit" :data="record" url="/iot/gateway/edit" v-auth="'iot:gateway:edit'">修改</UTag>
        <UTag func="del" :data="record" url="/iot/gateway/del" v-auth="'iot:gateway:del'">删除</UTag>
      </template>
    </UViewTable>
  </UView>
</template>
<!-- 协议网关功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "Gateway",
  setup() {

    let sslStatus = ref([
      {label: '是', value: true},
      {label: '否', value: false},
    ]);

    let gatewayType = ref([
      {label: '客户端', value: 'client'},
      {label: '服务端', value: 'server'},
    ])

    let gatewayStatus = ref([
      {label: '启用', value: 'start'},
      {label: '停用', value: 'stop'},
    ])

    let columns = ref([
      {field: "name", title: "网关名称"},
      {field: "type", title: "网关类型", options: gatewayType.value},
      {field: "host", title: "网关主机"},
      {field: "port", title: "网关端口"},
      {field: "username", title: "用户名"},
      {field: "status", title: "网关状态", options: gatewayStatus.value},
      // {field: "useSsl", title: "是否启用ssl", options: sslStatus.value},
      {field: "password", title: "密码"},
      {field: "protocolType", title: "传输协议", url: "/iot/gateway/transportProtocol"},
      // {field: "allIdle", title: "读写空闲"},
      // {field: "readIdle", title: "读空闲"},
      // {field: "writeIdle", title: "写空闲"},
      {field: "remark", title: "备注"},
      {field: "createTime", title: "创建时间", type: 'date', format: 'date'},
      {field: "updateTime", title: "更新时间", type: 'date', format: 'date'},
      {field: 'action', title: '操作', type: 'action', fixed: 'right', width: 180},
    ]);


    let rules = reactive({
      name: {required: true, message: '网关名称必填'},
      type: {required: true, message: '网关类型必填'},
      ssl: {required: true, message: '是否启用ssl必填'},
      protocolId: {required: true, message: '应用协议必填'},
      protocolType: {required: true, message: '协议类型必填'},
      // allIdle: {required: true, message: '读写空闲必填'},
      // readIdle: {required: true, message: '读空闲必填'},
      // writeIdle: {required: true, message: '写空闲必填'},
      remark: {required: true, message: '备注必填'},
    })

    let protocolSource = ref({});
    let editModel = ref({});
    let searchModel = ref({});
    return {columns, rules, editModel, searchModel, gatewayType, gatewayStatus, sslStatus, protocolSource}
  },
}
</script>
<style scoped> </style>
