<template>
  <UView name="dtu">
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="DTU名称" />
        <UInputItem field="deviceSn" label="DTU编号" />
        <USelectItem field="status" label="DTU状态" dict="iot_device_status" :allowClear="true" />
        <UButton func="query" url="/iot/dtu/view" v-auth="'iot:dtu:view'">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/dtu/add" v-auth="'iot:dtu:add'">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewModal title="DTU设备管理" :span="[7, 14]" v-model="editModel" :rules="rules">
      <UInputItem field="name" label="DTU名称" />
      <UInputItem field="deviceSn" label="DTU注册号" extra="dtu第一帧必须是此编号" />
      <UTreeSelectItem field="deviceTypeId" label="协议类型" url="/iot/deviceType/tree?alias=DTU" labelField="name"
        valueField="id" />
      <USelectItem field="model" label="设备型号" labelField="model" valueField="id"
        url="/iot/deviceModel/listByType?typeId={deviceTypeId}" />
      <UInputItem field="ip" label="ip地址" />
      <UInputNumberItem field="port" label="DTU端口" />
      <template #footer="{model}">
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/dtu/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewModal>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #status="{record, value}">
        <a-badge v-if="record.status=='online'" status="processing" :text="value" />
        <a-badge v-else status="warning" :text="value" />
      </template>
      <template #action="{record}">
        <UFuncTag func="edit" :data="record" url="/iot/dtu/edit" v-auth="'iot:dtu:edit'">修改</UFuncTag>
        <UFuncTag func="open" uid="child" :data="record" color="#2db7f5" v-auth="'iot:dtu:child'">子设备</UFuncTag>
        <UFuncTag func="del" :data="record" url="/iot/dtu/del" v-auth="'iot:dtu:del'">删除</UFuncTag>
        <UFuncTag func="open" uid="debug" :data="record" color="#87d068" url="/iot/dtu/debug" v-auth="'iot:dtu:debug'">
          调试</UFuncTag>
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
        <UViewTable :columns="childColumns" :scroll="{x: 1200}">
          <template #action="{record}">
            <UFuncTag func="edit" :data="record" url="/iot/deviceChild/edit">修改</UFuncTag>
            <UFuncTag func="del" :data="record" url="/iot/deviceChild/del">删除</UFuncTag>
          </template>
        </UViewTable>
        <UViewModal title="子设备管理" :span="[7, 14]" :rules="childRules" @edit="childEdit">
          <UInputItem label="设备名称" field="name" />
          <UInputItem label="设备地址" field="childSn" extra="设备从机地址" />
          <UTextareaItem label="备注" field="remark" />
          <template #footer="{model}">
            <UButton func="cancel">取消</UButton>
            <UButton func="submit" url="/iot/deviceChild/saveOrUpdate">提交</UButton>
            <UButton func="reset">重置</UButton>
          </template>
        </UViewModal>
      </ULinkView>
    </UDrawer>
    <UDrawer uid="debug" :title="'DTU设备调试 ('+debugModel.deviceSn+')'" forceRender height="100%" placement="top"
      :closable="true" v-model:data="debugModel" @open="debugEdit">
      <ULinkView uid="debugView">
        <UViewSearch v-model="debugSearchModel">
          <URow col="search">
            <UInputItem field="name" label="名称" allowClear />
            <UInputItem field="childSn" label="设备地址" allowClear />
            <UButton func="query" url="/iot/deviceChild/view">搜索</UButton>
            <!--            <UButton func="reset">重置</UButton>-->
          </URow>
        </UViewSearch>
        <UViewTable :columns="debugColumns" :scroll="{x: 1200}" size="small">
          <template #cmd="{record}">
            <!-- <ASelect v-model:value="record['cmd']" :options="debugModel.deviceTypeId != 10 ? CmdOptions : CmdCusOptions"
              style="width: 100%" /> -->
            <ASelect v-model:value="record['cmd']" :options="CmdCusOptions" style="width: 100%" />
          </template>
          <template #start="{record}">
            <AInputNumber v-model:value="record['start']" :min="0" step="1" :max="65535" />
          </template>
          <template #type="{record}">
            <AInput v-model:value="record['writeValue']">
              <template #addonBefore>
                <ASelect v-model:value="record['type']" :options="TypeOptions" style="width: 86px;" />
              </template>
            </AInput>
          </template>
          <template #message="{record}">
            <AInput v-model:value="record['message']" :allowClear="true" />
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
                    [DTU编号] <label>{{debug['data']['model']['deviceSn']}}</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    [设备地址] <label>{{debug['data']['model']['childSn']}}</label>
                  </span>
                </ACol>
              </ARow>
              <div class="u-debug-desc">
                <label>[{{getTime(debug['data']['reqTime'])}}][请求报文]</label><span
                  class="u-debug-msg">{{debug['data']['reqMsg']}}</span>
              </div>
              <div class="u-debug-desc">
                <label>[{{getTime(debug['data']['respTime'])}}][响应报文]</label><span
                  class="u-debug-msg">{{debug['data']['respMsg']}}</span>
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
  import { reactive, ref } from "vue";
  import UFormDrawer from "@/components/drawer/FormDrawer";
  import { mapGetters } from "vuex";
  import { DebugWebsocket } from "@msn/iot/debug/websocket";

  export default {
    name: "DTU",
    components: { UFormDrawer },
    setup () {
      let ProtocolType = [
        { label: '自定义', value: "cus" },
        { label: 'modbus:rtu', value: "rtu" },
        { label: 'modbus:tcp', value: "tcp" },
      ]
      let CmdOptions = [
        { label: '读01', value: "01" },
        { label: '读02', value: "02" },
        { label: '读03', value: "03" },
        { label: '读04', value: "04" },
        { label: '写05', value: "05" },
        { label: '写06', value: "06" },
        { label: '写10', value: "10" },
        { label: '写0F', value: "0F" },
      ];
      let TypeOptions = [
        { label: 'int', value: 'int' },
        { label: 'short', value: 'short' },
        { label: 'long', value: 'long' },
        { label: 'float', value: 'float' },
        { label: 'double', value: 'double' },
        { label: 'string', value: 'string' },
        { label: 'boolean', value: 'boolean' },
      ]
      let columns = ref([
        { field: "name", title: "DTU名称", width: 220 },
        { field: "deviceSn", title: "DTU编号", width: 220 },
        { field: "deviceTypeName", title: "设备类型", ellipsis: true, width: 150 },
        { field: "modelName", title: "设备型号", ellipsis: true, width: 150 },
        { field: "ip", title: "IP地址", width: 160 },
        { field: "port", title: "DTU端口", width: 80 },
        { field: "switchTime", title: "上/下线时间", type: 'date', width: 160 },
        { field: "status", title: "DTU状态", dict: 'iot_device_status', width: 80 },
        { field: 'action', title: '操作', width: 260, fixed: 'right' },
      ]);
      let childColumns = ref([
        { field: "name", title: "设备名称", width: 220 },
        { field: "childSn", title: "设备地址", width: 180 },
        { field: "remark", title: "备注", width: 280 },
        // {field: "status", title: "状态", width: 180},
        { field: "action", title: "操作", width: 180 },
      ]);
      let debugColumns = ref([
        { field: "name", title: "名称", width: 180 },
        { field: "childSn", title: "设备地址", width: 80 },
        { field: "cmd", title: "指令", width: 100 },
        { field: "type", title: "值类型", width: 160 },
        { field: "start", title: "起始地址", width: 120 },
        { field: "message", title: "自定义报文", width: 420 },
        { field: "action", title: "操作", fixed: 'right', width: 100 },
      ]);
      let CmdCusOptions = [
        { label: '读', value: "read" },
        { label: '写(设备会响应)', value: "write" },
        { label: '异步写(设备不会响应)', value: "writeOfAsync" },
      ]
      let debugCusColumns = ref([]);
      let rules = reactive({
        name: { required: true, message: '设备名称必填' },
        model: { required: true, message: '设备型号必填' },
        status: { required: true, message: '设备状态必填' },
        deviceSn: { required: true, message: '设备编号必填' },
        deviceTypeId: { required: true, message: '设备类型必填' },
      })
      let childRules = reactive({
        name: { required: true, message: '名称必填' },
        childSn: { required: true, message: '设备地址必填' },
      })
      /**
       * @type {WebSocket}
       */
      let debugSocket = ref(null);

      let editModel = ref({});
      let searchModel = ref({});
      let debugInfo = ref([]);
      let debugModel = ref({ deviceSn: null, deviceTypeId: null });
      let debugSearchModel = ref({ uid: null });
      let childSearchModel = ref({ uid: null });
      let childModel = ref({ deviceSn: null, name: '', uid: null });

      /**
       * @type {DebugWebsocket}
       */
      let debugWebsocket = new DebugWebsocket('dtu', (data) => {
        debugInfo.value.push(data);
      });

      return {
        columns, rules, editModel, searchModel, ProtocolType, debugModel, debugColumns, debugSearchModel, childSearchModel
        , childColumns, childModel, childRules, debugInfo, debugSocket, CmdOptions, TypeOptions, debugWebsocket, debugCusColumns, CmdCusOptions
      }
    },
    computed: {
      ...mapGetters({
        user: 'sys/user'
      })
    },
    methods: {
      getTime (time) {
        let date = new Date(time);
        return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      },
      getValueDesc ({ model }) {
        let cmd = parseInt(model['cmd']);
        console.log(11, JSON.stringify(model))
        if (isNaN(cmd)) {
          return cmd == 'read' ? ('读') : cmd == 'write' ? '写' : '异步写';
        } else {
          return cmd <= 4 ? ('读' + model.type + "值") : ('写' + model.type + "值");
        }
      },
      childEdit (editModel) {
        editModel.uid = editModel.uid || this.childModel.uid;
      },
      childOpen (data) {
        this.childModel = data;
        this.childSearchModel.uid = data.uid;
      },
      debugEdit (editModel) {
        // this.debugModel = editModel;
        console.log(444, JSON.stringify(editModel))
        this.debugSearchModel.uid = editModel.uid;
        if (editModel.deviceTypeId == 10) {
          this.debugCusColumns = this.debugColumns.splice(3, 2);
        } else {
          if (this.debugColumns.length == 5) {
            this.debugColumns.splice(3, 0, ...this.debugCusColumns)
          }
        }
      },
      debugSend (record) {
        record['deviceSn'] = this.debugModel.deviceSn;
        let deviceTypeId = this.debugModel.deviceTypeId;
        record['protocolType'] = deviceTypeId == 8 ? 'rtu' : deviceTypeId == 9 ? 'tcp' : 'cus';
        this.debugWebsocket.debug(record);
      }
    }
  }
</script>
<style scoped>
  .u-debug-desc {
    position: relative;
    margin: 0px 16px;
  }

  .u-debug-msg {
    margin: 0px 5px;
  }

  .u-debug-col {
    margin: 3px 8px;
    display: inline-block;
  }

  .u-debug-col.left {
    float: left;
  }

  .u-debug-col.right {
    float: right;
  }

  .u-debug-status {
    margin-left: 3px;
  }
</style>