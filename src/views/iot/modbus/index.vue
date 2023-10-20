<template>
  <UView name="设备" urlAuth>
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="设备名称" :allowClear="true" />
        <UInputItem field="deviceSn" label="设备编号" :allowClear="true" />
        <UTreeSelectItem field="deviceTypeId" label="设备类型" :allowClear="true"
          url="/iot/deviceType/tree?alias=MODBUS" labelField="name" valueField="id"/>
        <USelectItem field="status" label="设备状态" dict="iot_device_status" :allowClear="true" />
        <UButton func="query" url="/iot/modbus/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/modbus/add">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="设备管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="设备名称" />
        <UInputItem v-if="model.deviceTypeId != rtuId" field="deviceSn" label="设备编号" />
        <USelectItem v-else field="deviceSn" label="串口"
                     url="/iot/serial/list" valueField="com" labelField="com" />
        <UInputItem field="ip" label="ip地址" v-if="model.deviceTypeId != rtuId"/>
        <UInputNumberItem field="port" label="设备端口" v-if="model.deviceTypeId != rtuId"/>
        <UTreeSelectItem field="deviceTypeId" label="设备类型"
          url="/iot/deviceType/tree?alias=MODBUS" labelField="name" valueField="id" />
        <USelectItem field="model" label="设备型号" labelField="model" valueField="id"
                 url="/iot/deviceModel/listByType?typeId={deviceTypeId}"/>
      </template>
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/modbus/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #status="{record, value}">
        <a-badge v-if="record.status=='online'" status="processing" :text="value" />
        <a-badge v-else status="warning" :text="value" />
      </template>
      <template #action="{record}">
        <UTag func="edit" :data="record" url="/iot/modbus/edit" v-auth="'iot:modbus:edit'">修改</UTag>
        <UTag func="del" :data="record" url="/iot/modbus/del" v-auth="'iot:modbus:del'">删除</UTag>
        <UTag func="ajax" :data="record" color="#55acee" v-auth="'iot:modbus:connect'"
                  :url="'/iot/modbus/connect/'+(record.status=='online' ? 'offline' : 'online')">
          {{record.status=='online' ? '断开' : '连接'}}
        </UTag>
        <UTag func="open" uid="child" :data="record" color="#2db7f5" v-auth:or="['iot:modbus:add', 'iot:modbus:edit']">子设备</UTag>
        <UTag func="open" uid="debug" :data="record" color="#87d068" url="/iot/modbus/debug" v-auth="'iot:modbus:debug'">调试</UTag>
      </template>
    </UViewTable>
    <UDrawer uid="child" width="78%" :title="'子设备管理('+childModel.name+')'" @open="childOpen">
      <ULinkView uid="childView">
        <UViewSearch v-model="childSearchModel">
          <URow col="search">
            <UInputItem field="name" label="设备名称" />
            <UInputItem field="childSn" label="设备编号" />
            <UButton func="query" url="/iot/deviceChild/view">搜索</UButton>
            <UButton func="reset">重置</UButton>
            <UButton func="add" url="/iot/deviceChild/add">新增</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="childColumns">
          <template #action="{record}">
            <UFuncTag func="edit" :data="record" url="/iot/deviceChild/edit">修改</UFuncTag>
            <UFuncTag func="del" :data="record" url="/iot/deviceChild/del">删除</UFuncTag>
          </template>
        </UViewTable>
        <UViewModal title="子设备管理" :span="[7, 14]" :rules="childRules" @edit="childEdit">
          <UInputItem label="设备名称" field="name" />
          <UInputItem label="设备地址" field="childSn" extra="设备从机地址" />
          <UTextareaItem label="备注" field="remark"/>
          <template #footer="{model}">
            <UButton func="cancel">取消</UButton>
            <UButton func="submit" url="/iot/deviceChild/saveOrUpdate">提交</UButton>
            <UButton func="reset">重置</UButton>
          </template>
        </UViewModal>
      </ULinkView>
    </UDrawer>
    <UDrawer uid="debug" :title="'DTU设备调试 ('+debugModel.deviceSn+')'" forceRender
             height="100%" placement="top" :closable="true" v-model:data="debugModel" @open="debugEdit">
      <ULinkView uid="debugView">
        <UViewSearch v-model="debugSearchModel">
          <URow col="search">
            <UInputItem field="name" label="名称" allowClear/>
            <UInputItem field="childSn" label="设备地址" allowClear />
            <UButton func="query" url="/iot/deviceChild/view">搜索</UButton>
            <!--            <UButton func="reset">重置</UButton>-->
          </URow>
        </UViewSearch>
        <UViewTable :columns="debugColumns" :scroll="{x: 1000}" size="small">
          <template #cmd="{record}">
            <ASelect v-model:value="record['cmd']" :options="debugModel.deviceTypeId != 10 ? CmdOptions : CmdCusOptions" style="width: 100%" />
          </template>
          <template #start="{record}">
            <AInputNumber v-model:value="record['start']" :min="0" step="1" :max="65535" :defaultValue="0"/>
          </template>
          <template #type="{record}">
            <AInput v-model:value="record['writeValue']">
              <template #addonBefore>
                <ASelect v-model:value="record['type']" :options="TypeOptions" style="width: 86px;" />
              </template>
            </AInput>
          </template>
          <template #message="{record}">
            <AInput v-model:value="record['message']" :allowClear="true"/>
          </template>
          <template #action="{record}">
            <AButton size="small" type="primary" @click="() => debugSend(record)">发送</AButton>
          </template>
        </UViewTable>
        <div style="padding: 5px 0px">
          <AButton type="primary" @click="() => debugInfo.length = 0">清除</AButton>
        </div>
        <div style="height: 220px; border: 1px solid #e3e3e3; overflow-y: auto">
          <template v-for="debug in debugInfo">
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
                  <span v-show="debugModel.deviceTypeId != 10">
                    <label>[{{getValueDesc(debug['data'])}}] =</label>&nbsp;{{debug['data']['value']}}
                  </span>
                </ACol>
                <ACol span="8" style="text-align: center;">
                  <span style="color: #cc8500">
                    [指令]&nbsp;{{debug['data']['model']['cmd']}}
                  </span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>
                    [耗时] <label>{{debug['data']['respTime'] - debug['data']['reqTime']}}ms</label>
                  </span>
                </ACol>
                <ACol span="8" style="text-align: right">
                  <span>
                    [设备编号] <label>{{debug['data']['model']['deviceSn']}}</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    [设备地址] <label>{{debug['data']['model']['childSn']}}</label>
                  </span>
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
      </ULinkView>
    </UDrawer>
  </UView>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
import {DebugWebsocket} from "@msn/iot/debug/websocket";
import CoreConsts from "@/components/CoreConsts";
export default {
  name: "MODBUS",
  setup() {
    let columns = ref([
      {field: "name", title: "设备名称", width: 200},
      {field: "deviceSn", title: "设备编号", width: 200},
      {field: "deviceTypeId", title: "设备类型", url: '/iot/deviceType/tree'
        , labelField: 'name', valueField: 'id', width: 150, ellipsis: true},
      {field: "model", title: "设备型号", width: 150, url: '/iot/deviceModel/listByType?typeId=-1'
        , labelField: 'model', valueField: 'id', ellipsis: true},
      {field: "ip", title: "设备ip", width: 150},
      {field: "port", title: "设备端口", width: 80},
      {field: "status", title: "设备状态", dict: 'iot_device_status', width: 80},
      {field: "switchTime", title: "上/下线时间", type: 'date', width: 160, ellipsis: true},
      {field: 'action', title: '操作', width: 270, fixed: 'right'},
    ]);

    let childColumns = ref([
      {field: "name", title: "设备名称", width: 220},
      {field: "childSn", title: "设备地址", width: 180},
      {field: "remark", title: "备注", width: 280},
      // {field: "status", title: "状态", width: 180},
      {field: "action", title: "操作", width: 180},
    ]);
    let CmdOptions = [
      {label: '读01', value: "01"},
      {label: '读02', value: "02"},
      {label: '读03', value: "03"},
      {label: '读04', value: "04"},
      {label: '写05', value: "05"},
      {label: '写06', value: "06"},
      {label: '写10', value: "10"},
      {label: '写0F', value: "0F"},
    ];
    let debugColumns = ref([
      {field: "name", title: "名称", width: 180},
      {field: "childSn", title: "设备地址", width: 80},
      {field: "cmd", title: "指令", width: 100},
      {field: "type", title: "值类型", width: 160},
      {field: "start", title: "起始地址", width: 120},
      {field: "message", title: "自定义报文", width: 420},
      {field: "action", title: "操作", fixed: 'right', width: 100},
    ]);
    let CmdCusOptions = [
      {label: '读', value: "read"},
      {label: '写(设备会响应)', value: "write"},
      {label: '异步写(设备不会响应)', value: "writeOfAsync"},
    ]
    let TypeOptions = [
      {label: 'int', value: 'int'},
      {label: 'short', value: 'short'},
      {label: 'long', value: 'long'},
      {label: 'float', value: 'float'},
      {label: 'double', value: 'double'},
      {label: 'string', value: 'string'},
      {label: 'boolean', value: 'boolean'},
    ]
    let debugCusColumns = ref([]);
    /**
     * @type {WebSocket}
     */
    // let debugSocket = ref(null);
    let rules = reactive({
      ip: {required: true, message: 'ip地址必填'},
      name: {required: true, message: '设备名称必填'},
      port: {required: true, message: '设备端口必填'},
      model: {required: true, message: '设备型号必填'},
      status: {required: true, message: '设备状态必填'},
      deviceSn: {required: true, message: '设备编号必填'},
      deviceTypeId: {required: true, message: '设备类型必填'},
    })

    let rtuId = ref(24);
    let childRules = reactive({
      name: {required: true, message: '名称必填'},
      childSn: {required: true, message: '设备地址必填'},
    })
    let searchModel = ref({});
    let editModel = ref({deviceSn: null});
    let debugInfo = ref([]);
    let debugModel = ref({deviceSn: null, deviceTypeId: null});
    let debugSearchModel = ref({uid: null});

    let childSearchModel = ref({uid: null});
    let childModel = ref({deviceSn: null, name: '', uid: null});

    /**
     * @type {DebugWebsocket}
     */
    let debugWebsocket = new DebugWebsocket('modbus', (data) => {
      debugInfo.value.push(data);
    });
    return {rtuId, columns, rules, editModel, searchModel, childColumns, childRules, childSearchModel, childModel
      , debugSearchModel, debugModel, debugInfo, CmdOptions, debugCusColumns, debugColumns, CmdCusOptions, TypeOptions, debugWebsocket}
  },
  methods: {
    getTime(time) {
      let date = new Date(time);
      return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    },
    getValueDesc({model}) {
      let cmd = parseInt(model['cmd']);
      if(isNaN(cmd)) {
        return cmd == 'read' ? ('读') : cmd == 'write' ? '写' : '异步写';
      } else {
        return cmd <=4 ? ('读' + model.type + "值") : ('写' + model.type + "值");
      }
    },
    debugEdit(editModel) {
      this.debugSearchModel.uid = editModel.uid;
      if(editModel.deviceTypeId == 10) {
        this.debugCusColumns = this.debugColumns.splice(3, 2);
      } else {
        if(this.debugColumns.length == 5) {
          this.debugColumns.splice(3, 0, ...this.debugCusColumns)
        }
      }
    },
    debugSend(record) {
      record['host'] = this.debugModel.ip;
      record['port'] = this.debugModel.port;
      record['deviceSn'] = this.debugModel.deviceSn;
      let deviceTypeId = this.debugModel.deviceTypeId;
      record['protocolType'] = deviceTypeId == this.rtuId ? 'rtu' : 'tcp';
      if(record['protocolType'] == 'rtu') {
        this.$http.get(`/iot/serial/getByCom?com=${record['deviceSn']}`).then(({data, message, code}) => {
          if(code == CoreConsts.SuccessCode) {
            record['baudRate'] = data['baudRate'];
            record['dataBits'] = data['dataBits'];
            record['parity'] = data['parity'];
            record['stopBits'] = data['stopBits'];
            this.debugWebsocket.debug(record);
          } else {
            this.$msg.error("串口不存在["+this.debugModel.deviceSn+"]")
          }
        })
      } else {
        this.debugWebsocket.debug(record);
      }
    },
    childOpen(data) {
      this.childModel = data;
      this.childSearchModel.uid = data.uid;
    },
    childEdit(editModel) {
      editModel.uid = editModel.uid || this.childModel.uid;
    }
  }
}
</script>
<style scoped>

</style>
