<template>
  <UView name="设备" urlAuth>
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="PLC名称" :allowClear="true" />
        <UInputItem field="deviceSn" label="PLC编号" :allowClear="true" />
        <UTreeSelectItem field="deviceTypeId" label="PLC类型" :allowClear="true"
          url="/iot/deviceType/tree?alias=PLC" labelField="name" valueField="id"/>
        <USelectItem field="status" label="PLC状态" dict="iot_device_status" :allowClear="true" />
        <UButton func="query" url="/iot/plc/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/plc/add">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="PLC设备管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="PLC名称" />
        <UInputItem field="deviceSn" label="PLC编号" />
        <UInputItem field="ip" label="ip地址" />
        <UInputNumberItem field="port" label="PLC端口"/>
        <UTreeSelectItem field="deviceTypeId" label="PLC类型"
          url="/iot/deviceType/tree?alias=PLC" labelField="name" valueField="id" />
        <USelectItem field="model" label="PLC型号" labelField="model" valueField="id"
                 url="/iot/deviceModel/listByType?typeId={deviceTypeId}"/>
      </template>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/plc/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #status="{record, value}">
        <a-badge v-if="record.status=='online'" status="processing" :text="value" />
        <a-badge v-else status="warning" :text="value" />
      </template>
      <template #action="{record}">
        <UFuncTag func="edit" :data="record" url="/iot/plc/edit" v-auth="'iot:plc:edit'">修改</UFuncTag>
        <UFuncTag func="del" :data="record" url="/iot/plc/del" v-auth="'iot:plc:del'">删除</UFuncTag>
        <UFuncTag func="ajax" :data="record" color="#55acee" v-auth="'iot:plc:connect'"
                  :url="'/iot/plc/connect?status='+(record.status=='online' ? 'offline' : 'online')">
          {{record.status=='online' ? '断开' : '连接'}}
        </UFuncTag>
        <UFuncTag func="open" uid="debug" :data="record" url="/iot/plc/debug" color="#87d068" v-auth="'iot:plc:debug'">调试</UFuncTag>
      </template>
    </UViewTable>
    <UDrawer uid="debug" v-model:data="debugModel" placement="top" height="100%">
      <template #title>
        <a-space :size="30">
          <span>{{'PLC调试 ('+debugModel.deviceSn+')'}}</span>
          <span>ip：{{debugModel.ip}}</span>
          <span>端口：{{debugModel.port}}</span>
          <span>设备状态：{{debugModel.status=='online' ? '在线' : '离线'}}</span>
        </a-space>
      </template>
      <AForm layout="inline">
        <ARow class="u-debug-row">
          <AFormItem label="数据类型">
            <a-radio-group v-model:value="debugParam.type" name="type">
              <a-radio value="bit">bit</a-radio>
              <a-radio value="short">short</a-radio>
              <a-radio value="ushort">ushort</a-radio>
              <a-radio value="int">int</a-radio>
              <a-radio value="uint">uint</a-radio>
              <a-radio value="long">long</a-radio>
              <a-radio value="float">float</a-radio>
              <a-radio value="double">double</a-radio>
            </a-radio-group>
          </AFormItem>
        </ARow>
        <ARow class="u-debug-row">
            <AFormItem label="地址" name="address">
              <AInput v-model:value="debugParam.address"/>
            </AFormItem>
            <AButton type="primary" @click="() => execDebug('read')">读取</AButton>
            &nbsp;&nbsp;&nbsp;
            <AFormItem label="值">
              <AInput v-model:value="debugParam.value" />
            </AFormItem>
            <AButton type="primary" @click="() => execDebug('write')">写入</AButton>
        </ARow>
        <ARow class="u-debug-row">
          <ACol span="21">
            <AFormItem label="自定义报文">
              <AInput v-model:value="debugParam.message"/>
            </AFormItem>
          </ACol>
          <ACol span="3">
            <AButton type="primary" @click="() => execDebug('message')">发送</AButton>
          </ACol>
        </ARow>
      </AForm>
      <AButton type="primary" @click="clear">清除</AButton>
      <div class="u-debug-output">
        <template v-for="debug in debugOutput">
          <div style="margin: 3px 0px 6px">
            <ARow class="u-debug-desc">
              <ACol span="8" style="text-align: left">
                  <span v-if="debug['code'] == 200" style="color: green">
                    [状态]&nbsp;成功
                  </span>
                <span v-else style="color: #d4380d">
                    [状态]&nbsp;{{debug['message']}}
                  </span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    <label>[{{getValueDesc(debug['data'])}}] =</label>&nbsp;{{debug['data']['value']}}
                  </span>
              </ACol>
              <ACol span="8" style="text-align: center;">
                  <span style="color: #cc8500">
                    [类型] {{debug['data']['model']['type']}}
                  </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>
                    [耗时] <label>{{debug['data']['respTime'] - debug['data']['reqTime']}}ms</label>
                  </span>
              </ACol>
              <ACol span="8" style="text-align: right">

              </ACol>
            </ARow>
            <div class="u-debug-desc">
              <label>[{{getTime(debug['data']['reqTime'])}}][请求报文]</label><span class="u-debug-msg">{{debug['data']['reqMsg']}}</span>
            </div>
            <div class="u-debug-desc">
              <label>[{{getTime(debug['data']['respTime'])}}][响应报文]</label><span class="u-debug-msg">{{debug['data']['respMsg']}}</span>
            </div>
          </div>
        </template>
      </div>
    </UDrawer>
  </UView>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
import {DebugWebsocket} from "@msn/iot/debug/websocket";
export default {
  name: "PLCDevice",
  setup() {
    let columns = ref([
      {field: "name", title: "PLC名称", width: 200},
      {field: "deviceSn", title: "PLC编号", width: 200},
      {field: "deviceTypeId", title: "PLC类型", url: '/iot/deviceType/tree'
        , labelField: 'name', valueField: 'id', width: 100},
      {field: "model", title: "PLC型号", width: 100, url: '/iot/deviceModel/listByType?typeId=-1'
        , labelField: 'model', valueField: 'id'},
      {field: "ip", title: "ip", width: 150},
      {field: "port", title: "端口", width: 80},
      {field: "status", title: "设备状态", dict: 'iot_device_status', width: 80},
      {field: "switchTime", title: "上/下线时间", type: 'date', width: 160},
      {field: 'action', title: '操作', width: 230, fixed: 'right'},
    ]);

    let rules = reactive({
      ip: {required: true, message: 'ip地址必填'},
      name: {required: true, message: 'PLC名称必填'},
      port: {required: true, message: 'PLC端口必填'},
      model: {required: true, message: 'PLC型号必填'},
      status: {required: true, message: 'PLC状态必填'},
      deviceSn: {required: true, message: 'PLC编号必填'},
      deviceTypeId: {required: true, message: 'PLC类型必填'},
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
