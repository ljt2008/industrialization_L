<template>
  <UView name="报文协议">
    <UViewSearch v-model="searchModel">
      <URow col="search">
        <UInputItem field="name" label="协议名称" :allowClear="true"/>
        <UInputItem field="code" label="协议代码" :allowClear="true"/>
        <USelectItem field="type" label="传输协议" url="/iot/gateway/transportProtocol" />
        <USelectItem field="ctrlMode" label="操控方式" url="/iot/protocol/ctrlModes" defaultValue="COMMON" :allowClear="true"/>
        <URadioItem field="implMode" label="实现方式" url="/iot/protocol/implModes"
                    optionType="button" buttonStyle="solid" defaultValue="Jar"/>
        <UButton func="query" url="/iot/protocol/view">搜索</UButton>
        <UButton func="reset">重置</UButton>
        <UButton func="add" url="/iot/protocol/add" v-auth="'iot:protocol:add'">新增</UButton>
      </URow>
    </UViewSearch>
    <UViewDrawer title="报文协议管理" :span="[6, 16]" v-model="editModel" :rules="rules">
      <template #default="{model}">
        <UInputItem field="name" label="协议名称" />
        <USelectItem field="type" label="传输协议" url="/iot/gateway/transportProtocol" :disabled="model['implMode'] == 'Internal'" />
        <URadioItem field="implMode" label="实现方式" url="/iot/protocol/implModes" defaultValue="Jar"
                    optionType="button" buttonStyle="solid" :disabled="model['implMode'] == 'Internal'"/>
        <UUploadItem v-if="editModel['implMode'] == 'Jar'" field="jarPath" label="jar文件" :withCredentials="true"
                     :action="`${$apiUrl}/common/upload?subPath=jar`" filename="file" accept=".jar" :maxCount="1">
          <a-input-group compact>
            <AInput v-model:value="editModel['jarPath']" disabled style="width: 60%"/>
            <AButton><UIcon type="iz-icon-upload" /> 点击上传</AButton>
          </a-input-group>
        </UUploadItem>
        <UInputItem field="code" label="协议代码" :disabled="model['id'] || model['implMode'] == 'Jar'" extra="协议代码请用[a-zA-Z:-_]且必须唯一" />
        <URadioItem field="ctrlMode" label="操控方式" url="/iot/protocol/ctrlModes" :disabled="model['implMode'] == 'Internal'"
                    optionType="button" buttonStyle="solid" defaultValue="COMMON"/>
        <!--        <UInputItem field="implClass" label="实现类" />-->
        <UTextareaItem field="remark" label="备注" />
<!--        <UInputItem field="checkType" label="校验类型" />-->
<!--        <UInputItem field="decoderType" label="解码器类型" />-->
<!--        <UInputItem field="decoderConfig" label="解码器配置" />-->
      </template>
      <template #footer>
        <UButton func="cancel">取消</UButton>
        <UButton func="submit" url="/iot/protocol/saveOrUpdate">提交</UButton>
        <UButton func="reset">重置</UButton>
      </template>
    </UViewDrawer>
    <UViewTable :columns="columns" :scroll="{x: 1200}">
      <template #action="{record}">
        <UTag func="edit" :data="record" url="/iot/protocol/edit" v-auth="'iot:protocol:edit'">修改</UTag>
        <UTag func="open" :data="record" uid="config" v-auth="'iot:protocol:config'">协议配置</UTag>
        <UTag func="del" :data="record" url="/iot/protocol/del" v-auth="'iot:protocol:del'">删除</UTag>
      </template>
    </UViewTable>
    <UDrawer uid="config" placement="top" height="100%">

    </UDrawer>
  </UView>
</template>
<!-- 报文协议功能 -->
<script>
import {ref, reactive} from "vue";
export default {
  name: "Protocol",
  setup() {
    let columns = ref([
      {field: "name", title: "协议名称"},
      {field: "code", title: "协议代码"},
      {field: "type", title: "传输协议", url: '/iot/gateway/transportProtocol'},
      {field: "ctrlMode", title: "操控方式", url: "/iot/protocol/ctrlModes"},
      {field: "implMode", title: "实现方式", url: "/iot/protocol/implModes"},
      // {field: "jarPath", title: "jar文件路径"},
      {field: "remark", title: "备注"},
      // {field: "checkType", title: "校验类型"},
      // {field: "decoderType", title: "解码器类型"},
      // {field: "decoderConfig", title: "解码器配置"},
      {field: "createTime", title: "创建时间", type: 'date', format: 'YYYY-MM-DD'},
      {field: 'action', title: '操作', type: 'action', fixed: 'right', width: 260},
    ]);

    let rules = reactive({
      name: {required: true, message: '协议名称必填'},
      code: {required: true, message: '协议代码必填'},
      type: {required: true, message: '传输协议必填'},
      ctrlMode: {required: true, message: '操控方式必填'},
      jarPath: {required: true, message: 'jar文件必填'},
      implMode: {required: true, message: '实现方式必填'},
    })

    let editModel = ref({});
    let searchModel = ref({});
    return {columns, rules, editModel, searchModel}
  },
}
</script>
<style scoped> </style>
