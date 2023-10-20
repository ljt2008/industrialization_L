<template>
  <UView name="点位组">
    <UViewDrawer title="点位组管理" :span="[3, 21]" v-model="editModel" :rules="rules" placement="top" height="100%" @edit="edit">
      <template #default="{model}">
        <UInputItem field="name" label="组名称" />
        <UTreeSelectItem field="typeId" label="设备类型"
                     url="/iot/deviceType/tree" labelField="name" valueField="id"/>
        <USelectItem field="modelId" label="所属型号" labelField="model" valueField="id"
                 url="/iot/deviceModel/listByType?typeId={typeId}"/>
        <UTransferItem label="点位列表" field="signalIds" labelField="name" valueField="id" :span="24" :wrapperCol="{span: 24}"
                   url="/iot/signal/listByModel?modelId={modelId}" :show-select-all="false">
          <template #children="{direction, filteredItems, selectedKeys,
                    disabled: listDisabled, onItemSelectAll, onItemSelect}">
            <a-table :row-selection="getRowSelection(
                    {disabled: listDisabled, selectedKeys,onItemSelectAll, onItemSelect})"
                     :columns="direction === 'left' ? leftColumns : rightColumns"
                     :data-source="filteredItems" size="small" row-key="id" bordered
                     :style="{ pointerEvents: listDisabled ? 'none' : null }"
                     :custom-row="({ key, disabled: itemDisabled }) => ({
                      onClick: () => {
                        if (itemDisabled || listDisabled) return;
                        onItemSelect(key, !selectedKeys.includes(key));
                      },
                    })"/>
          </template>
        </UTransferItem>
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/pointGroup/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewDrawer>
    <ARow :gutter="8">
      <ACol :md="8" :lg="7" :xxl="5" :xxxl="3">
        <ACard title="设备类型" class="u-border-radius">
          <UTree url="/iot/deviceType/tree" selectable blockNode showLine defaultExpandAll @select="selectType" />
        </ACard>
      </ACol>
      <ACol :md="16" :lg="17" :xxl="19" :xxxl="21">
        <UViewSearch v-model="searchModel">
          <URow col="search">
            <USelectItem field="modelId" label="所属型号" labelField="model" valueField="id"
                     url="/iot/deviceModel/listByType?typeId={typeId}" allowClear/>
            <UInputItem field="name" label="组名称" allowClear/>
            <UButton func="query" url="/iot/pointGroup/view" ref="searchRef">搜索</UButton>
            <UButton func="reset">重置</UButton>
            <UButton func="add" url="/iot/pointGroup/add" v-auth="'iot:pointGroup:add'">新增</UButton>
          </URow>
        </UViewSearch>
        <UViewTable :columns="columns">
          <template #action="{record}">
            <UFuncTag func="edit" :data="record" url="/iot/pointGroup/edit" v-auth="'iot:pointGroup:edit'">修改</UFuncTag>
            <UFuncTag func="del" :data="record" url="/iot/pointGroup/del" v-auth="'iot:pointGroup:del'">删除</UFuncTag>
          </template>
        </UViewTable>
      </ACol>
    </ARow>

  </UView>
</template>
<!-- 点位组功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "PointGroup",
  setup() {
    let columns = ref([
      {field: "name", title: "组名称"},
      {field: "typeName", title: "设备类型"},
      {field: "modelName", title: "设备型号"},
      {field: 'action', title: '操作', type: 'action'},
    ]);

    let rules = reactive({
        name: {required: true, message: '组名称必填'},
        modelId: {required: true, message: '所属型号必填'},
        createTime: {required: true, message: '必填'},
    })

    let editModel = ref({
      groupIds: []
    });

    const leftColumns = ref([
      {dataIndex: 'name', title: '点位名称', align: 'center', width: 180},
      // {dataIndex: 'address', title: '点位地址', align: 'center', width: 180},
      {dataIndex: 'fieldName', title: '字段名称', align: 'center', width: 180},
    ]);
    const rightColumns = ref([
      {dataIndex: 'name', title: '点位名称', align: 'center', width: 180},
      // {dataIndex: 'address', title: '点位地址', align: 'center', width: 180},
      {dataIndex: 'fieldName', title: '字段名称', align: 'center', width: 180}
    ]);

    let searchModel = ref({typeId: null});
    return {columns, rules, editModel, searchModel, leftColumns, rightColumns}
  },
  methods: {
    getRowSelection({disabled, selectedKeys, onItemSelectAll, onItemSelect}) {
      return {
        getCheckboxProps: item => ({
          disabled: disabled || item.disabled,
        }),

        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows.filter(item => !item.disabled).map(({key}) => key);
          onItemSelectAll(treeSelectedKeys, selected);
        },

        onSelect({ key}, selected) {
          onItemSelect(key, selected);
        },

        selectedRowKeys: selectedKeys,
      };
    },
    edit(editModel) {
      if(this.searchModel.typeId) {
        editModel.typeId = this.searchModel.typeId
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
