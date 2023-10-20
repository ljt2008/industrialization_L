<template>
  <UView name="设备">
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="客户端名称" :allowClear="true" />
        <USelectItem field="status" label="客户端状态" dict="iot_device_status" :allowClear="true" />
        <UButton func="query" url="/iot/mqtt/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/mqtt/add">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="Mqtt管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="客户端名称" />
        <UInputItem field="deviceSn" label="ClientId" />
        <UTreeSelectItem field="deviceTypeId" label="设备类型"
                     url="/iot/deviceType/tree?alias=MQTT" labelField="name" valueField="id" />
        <USelectItem field="model" label="Mqtt型号" labelField="model" valueField="id"
                 url="/iot/deviceModel/listByType?typeId={deviceTypeId}"/>
        <UInputItem field="ip" label="服务器ip" />
        <UInputNumberItem field="port" label="服务器端口"/>
        <UInputItem field="account" label="账号"/>
        <UInputPasswordItem field="password" label="密码"/>
      </template>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/mqtt/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #status="{record, value}">
        <a-badge v-if="record.status=='online'" status="processing" :text="value" />
        <a-badge v-else status="warning" :text="value" />
      </template>
      <template #action="{record}">
        <UFuncTag func="edit" :data="record" url="/iot/mqtt/edit" v-auth="'iot:mqtt:edit'">修改</UFuncTag>
        <UFuncTag func="del" :data="record" url="/iot/mqtt/del" v-auth="'iot:mqtt:del'">删除</UFuncTag>
        <UFuncTag func="ajax" :data="record" color="#55acee" v-auth="'iot:mqtt:connect'"
                  :url="'/iot/mqtt/connect?status='+(record.status=='online' ? 'offline' : 'online')">
          {{record.status=='online' ? '断开' : '连接'}}
        </UFuncTag>
        <UFuncTag func="open" uid="debug" :data="record" url="/iot/mqtt/debug" color="#87d068" v-auth="'iot:mqtt:debug'">调试</UFuncTag>
      </template>
    </UViewTable>
    <UDrawer uid="debug" v-model="debugModel" placement="top" height="100%">
      <template #title>
        <a-space :size="30" style="color: #2a2a2a">
          <span>{{'MQTT调试 ('+debugModel.deviceSn+')'}}</span>
          <span>ip：{{debugModel.ip}}</span>
          <span>端口：{{debugModel.port}}</span>
          <span>设备状态：{{debugModel.status=='online' ? '在线' : '离线'}}</span>
        </a-space>
      </template>
      <AForm layout="inline">
        <ARow class="u-debug-row">
          待开发中...
        </ARow>
      </AForm>
      <div class="u-debug-output">

      </div>
    </UDrawer>
  </UView>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
import {DebugWebsocket} from "@msn/iot/debug/websocket";
export default {
  name: "MQTT",
  setup() {
    let columns = ref([
      {field: "name", title: "客户端名称", width: 200, ellipsis: true},
      {field: "deviceSn", title: "ClientId", width: 200, ellipsis: true},
      {field: "modelName", title: "型号", width: 100, ellipsis: true},
      {field: "ip", title: "服务器ip", width: 150},
      {field: "port", title: "服务器端口", width: 100},
      {field: "account", title: "账号", width: 120, ellipsis: true},
      {field: "switchTime", title: "上/下线时间", type: 'date', width: 160},
      {field: "status", title: "设备状态", dict: 'iot_device_status', width: 80, fixed: 'right'},
      {field: 'action', title: '操作', width: 230, fixed: 'right'},
    ]);

    let rules = reactive({
      ip: {required: true, message: 'ip地址必填'},
      name: {required: true, message: '客户端名称必填'},
      port: {required: true, message: 'mqtt端口必填'},
      model: {required: true, message: 'mqtt型号必填'},
      deviceSn: {required: true, message: 'ClientId必填'},
      deviceTypeId: {required: true, message: '设备类型必填'},
    })

    let debugOutput = ref([]);
    let searchModel = ref({});
    let editModel = ref({deviceSn: null});
    let debugModel = ref({deviceSn: null});
    let debugParam = ref({type: null, cmd: null, address: null, plcType: null, message: null, ip: null, port: null, value: null});

    let debug = new DebugWebsocket("plc", data => {
      debugOutput.value.push(data)
    });

    let execDebug = cmd => {
      debugParam.value.cmd = cmd;
      debugParam.value.id = debugModel.value.id;
      debugParam.value.ip = debugModel.value.ip;
      debugParam.value.port = debugModel.value.port;
      debugParam.value.model = debugModel.value.modelName;
      debugParam.value.deviceSn = debugModel.value.deviceSn;
      debugParam.value.plcType = debugModel.value.deviceTypeId;
      debug.debug(debugParam.value);
    }

    return {columns, rules, editModel, searchModel, debugModel, debugParam, debug, execDebug, debugOutput}
  },
  methods: {
    getTime(time) {
      let date = new Date(time);
      return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    },
    getValueDesc({model}) {
      return model['cmd'] == 'read' ? ('读' + model.address) : ('写' + model.address);
    },
    clear() {
      this.debugOutput.length = 0;
    }
  }
}
</script>
<style scoped>
.u-debug-row {
  padding: 16px;
  width: 100%;
  margin: 5px 0px;
  border: 1px solid #e5e5e5;
}
.u-debug-output {
  width: 100%;
  margin: 5px 0px;
  overflow-y: auto;
  height: 220px;
  border: 1px solid #e5e5e5;
}
.u-debug-desc {
  position: relative;
  margin: 0px 16px;
}
.u-debug-msg {
  margin: 0px 5px;
}
</style>
