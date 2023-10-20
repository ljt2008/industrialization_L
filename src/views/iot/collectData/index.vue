<template>
  <UView name="采集数据">
    <ARow :gutter="8">
      <ACol span="6">
        <ACard title="设备类型" class="u-border-radius">
          <UTree url="/iot/deviceType/tree" selectable blockNode showLine defaultExpandAll @select="selectParent" />
        </ACard>
      </ACol>
      <ACol span="18">
        <UViewSearch v-model="searchModel">
          <URow col="search">
            <USelectItem field="modelId" label="型号" labelField="model" valueField="id"
                     url="/iot/deviceModel/listByType?typeId={deviceTypeId}"/>
            <USelectItem field="uid" label="设备" labelField="name" valueField="uid"
                     url="/iot/device/listByModel?modelId={modelId}"/>
            <USelectItem field="signalId" label="点位" labelField="name" valueField="id"
                     url="/iot/signal/listByModel?modelId={modelId}"/>
            <UButton func="query" url="/iot/collectData/view" ref="searchRef">搜索</UButton>
            <UButton func="reset">重置</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="columns" :scroll="{x: 1230}">
          <template #status="{record, text}">
            <a-tag color="#87d068" v-if="text">成功</a-tag>
            <a-tag color="#f50" v-else>失败</a-tag>
          </template>
          <!--      <template #action="{record}">-->
          <!--        <UFuncTag func="edit" :data="record" url="/iot/device/edit">修改</UFuncTag>-->
          <!--        <UFuncTag func="del" :data="record" url="/iot/device/del">删除</UFuncTag>-->
          <!--      </template>-->
        </UViewTable>
      </ACol>
    </ARow>
  </UView>
</template>
<!-- 设备功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "CollectData",
  setup() {
    let columns = ref([
      {field: "deviceName", title: "设备名称", width: 180, ellipsis: true},
      {field: "deviceSn", title: "设备编号", width: 160, ellipsis: true},
      {field: "address", title: "点位地址", width: 120},
      {field: "reason", title: "失败原因", width: 280, ellipsis: true},
      {field: "status", title: "采集状态", width: 80, fixed: 'right'},
      {field: "value", title: "采集值", width: 160, fixed: 'right'},
      {field: "collectTime", title: "采集时间", width: 150, type: 'date', format: 'YYYY-MM-DD HH:mm:ss', fixed: 'right'},
      // {field: 'action', title: '操作', type: 'action' , width: 150, fixed: 'right'},
    ]);

    let searchModel = ref({});
    return {columns, searchModel}
  },
  beforeRouteEnter(to, form, next) {
    next(vm => {
      if(to.query.taskId) {
        vm.searchModel['collectTaskId'] = to.query.taskId;
      }
    })
  },
  methods: {
    selectParent(selectedKeys) {
      this.searchModel.deviceTypeId = selectedKeys[0]
      this.$refs['searchRef'].trigger();
    }
  }
}
</script>
<style scoped> </style>
