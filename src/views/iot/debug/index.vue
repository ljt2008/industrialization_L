<template>
  <div style="height: 100%">
    <a-tabs type="card" @change="protocolChange">
      <a-tab-pane key="tcp" tab="TCP协议"></a-tab-pane>
      <a-tab-pane key="udp" tab="UDP协议"></a-tab-pane>
      <a-tab-pane key="mqtt" tab="MQTT协议"></a-tab-pane>
    </a-tabs>
    <div style="background: #ffffff">
      <router-view v-slot="{ Component }">
        <!--        <transition name="slide-fade" mode="out-in">-->
        <!--          <keep-alive :include="alive">-->
        <component :is="Component" />
        <!--          </keep-alive>-->
        <!--        </transition>-->
      </router-view>
    </div>
  </div>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
import router from "@/router";
import TCP from "./tcp.vue";
import UDP from "./udp.vue";
import MQTT from "./mqtt.vue";
import {DebugWebsocket} from "@msn/iot/debug/websocket";
export default {
  name: "Debug",
  setup() {
    let columns = ref([
      {field: "name", title: "设备名称", width: 180},
      {field: "deviceSn", title: "设备编号", width: 200},
      {field: "ip", title: "设备ip", width: 180},
      {field: "port", title: "设备端口", width: 80},
      {field: "switchTime", title: "上线时间", type: 'date', format: 'YYYY-MM-DD HH:mm'},
      {field: "status", title: "设备状态", dict: 'iot_device_status', width: 80, fixed: 'right'},
      {field: 'action', title: '操作', type: 'action' , width: 150, fixed: 'right'},
    ]);

    // 增加对应协议的路由信息
    let currentRoute = router.currentRoute.value;
    router.addRoute(currentRoute.name, {path: 'tcp', name: 'TCP', component: TCP, meta: {taskBar: false}})
    router.addRoute(currentRoute.name, {path: 'udp', name: 'UDP', component: UDP, meta: {taskBar: false}})
    router.addRoute(currentRoute.name, {path: 'mqtt', name: 'MQTT', component: MQTT, meta: {taskBar: false}})

    let debugWebsocket = new DebugWebsocket('tcp', (data) => {

    });
    let debugModel = ref({});
    let searchModel = ref({});
    let parentPath = ref(currentRoute.fullPath);
    return {columns, debugModel, searchModel, parentPath}
  },
  methods: {
    protocolChange(activeKey) {
      this.$router.push(this.parentPath + '/' + activeKey);
    }
  }
}
</script>
<style scoped>
.u-tcp.center {
  border: 1px solid #f1f1f1;
}
</style>