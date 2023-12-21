<template>
  <div style="width: 100%; height: 100%; overflow: auto" class="u-core-index">
    <ACard title="服务状况" class="u-row" size="small">
      <ARow type="flex" class="u-row">
        <ACol flex="auto">
          <div id="iot-server" style="height: 280px; width: 100%;"></div>
        </ACol>
        <!-- <ACol flex="460px">
          <ATable :columns="ComponentColumns" :data-source="serverComponents" :pagination="false" :showHeader="false">
            <template #title>
              <div style="text-align: center; font-size: 18px">
                <span>各socket服务详情</span>
              </div>
            </template>
          </ATable>
        </ACol> -->
      </ARow>
    </ACard>
    <ACard title="服务器状况" class="u-row" size="small">
      <ARow type="flex" class="u-row">
        <ACol flex="500px">
          <div id="iot-system-pm" style="width: 100%; height: 200px"></div>
          <a-card class="iot-system-profile">
            <a-card-grid style="width: 50%; text-align: center">
              操作系统：{{systemHealth.os}}
            </a-card-grid>
            <a-card-grid style="width: 50%; text-align: center">
              CPU架构：{{systemHealth.arch}}
            </a-card-grid>
            <a-card-grid style="width: 50%; text-align: center">
              总内存：{{systemHealth.totalPMSize}}(MB)
            </a-card-grid>
            <a-card-grid style="width: 50%; text-align: center">
              可用内存：{{systemHealth.freePMSize}}(MB)
            </a-card-grid>
          </a-card>
        </ACol>
        <ACol flex="auto">
          <div id="iot-system-cpu" style="width: 100%; height: 290px"></div>
        </ACol>
      </ARow>
    </ACard>
  </div>
</template>
<!--首页或者工作台-->
<script>
import * as echarts from 'echarts/core'
import {LineChart, PieChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {UniversalTransition} from 'echarts/features';
import {
  ToolboxComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'
import {onMounted, onUnmounted, ref} from "vue";
import {HealthWebsocket} from "@msn/iot/debug/websocket";
import CoreConsts from "@/components/CoreConsts";
import dayjs from "dayjs";
echarts.use([CanvasRenderer, TitleComponent, GridComponent, VisualMapComponent, LineChart
  , UniversalTransition, TooltipComponent, PieChart, LegendComponent, DatasetComponent, ToolboxComponent])

export default {
  name: "Index",
  setup() {
    let cpuCharts = null; // cpu使用率图表
    let pmCharts = null; // 内存使用饼状图表
    let componentCharts = null; // 服务器监听的端口信息图表

    let cpuValueList = [];
    let ComponentColumns = ref([
      {title: '组件', dataIndex: 'name', key: 'name'},
      {title: '端口', dataIndex: 'port', key: 'port'},
      {title: '协议', dataIndex: 'protocol', key: 'protocol'},
    ]);
    let serverHealth = ref({components: 0, tcpLinks: 0});
    let systemHealth = ref({os: '', arch: '', totalPMSize: '0', freePMSize: '0'});
    let componentHealth = ref([]);

    let health = new HealthWebsocket('system', (data) => {
      let {os, arch, version, totalPMSize, freePMSize} = data;
      systemHealth.value.os = os;
      systemHealth.value.arch = arch;
      systemHealth.value.version = version;

      let date = dayjs().format('HH:mm:ss');
      let freeUse = (freePMSize / 1024 / 1024).toFixed(0); // 未使用
      let usedSize= ((totalPMSize - freePMSize) / 1024 / 1024).toFixed(0) // 已使用内存

      systemHealth.value.freePMSize = freeUse;
      systemHealth.value.totalPMSize = (totalPMSize / 1024 / 1024).toFixed(0);
      if(cpuValueList.length > 100) {
        cpuValueList.splice(0, 1);
      }

      cpuValueList.push({value: data['systemCpuLoad'].toFixed(2), time: date})

      cpuCharts.setOption({
        series: [{
            data: cpuValueList.map(item => item['value'])
          }
        ],
        xAxis: [
          {
            data: cpuValueList.map(item => item['time'])
          }
        ],
      });

      pmCharts.setOption({
        series: [{
          data: [
            { value: usedSize, name: `已使用` },
            { value: freeUse, name: `未使用` },
          ]
        }],
      })
    });

    // 获取物联网启用监听的tcp信息
    let serverComponents = ref([]);
    let source = [], series = [], times = [];
    let serverSocket = new HealthWebsocket('server', ({components}) => {
      times.push(dayjs().format('HH:mm:ss'))
      if(serverComponents.value.length != components.length) {
        serverComponents.value = components;
      }

      if(source.length != components.length) {
        source = components.map(item => item['name']);
      }

      if(series.length != components.length) {
        components.forEach(item => {
          series.push({name: item['name'], type: 'line', stack: 'total', data: [item['linkingCount']]})
        })
      }
      if(cpuValueList.length > 100) {
        cpuValueList.splice(0, 1);
      }
      if(times.length > 100) {
        times.splice(0, 1);
      }
      components.forEach((item, index) => {
        let value = series[index];
        if(value) {
          if(value['data'].length > 100) {
            value['data'].splice(0, 1);
          }
          value['data'].push(item['linkingCount']);
        }
      })

      componentCharts.setOption({
        xAxis: {
          data: times
        },
        legend: {
          data: source
        },
        series: series,
      })
    })

    let currentDeviceDto = ref({online: 0, today: 0})
    let currentOnlineDto = ref({currentOnline: 0, todayAccess: 0})
    onMounted(() => {
      let valueList = cpuValueList;
      cpuCharts = echarts.init(document.getElementById("iot-system-cpu"));
      cpuCharts.setOption({
        title: {
          text: 'CPU使用率(%)',
          left: 'center',
        },
        visualMap: [
          {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 1
          }
        ],
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: valueList
          }
        ],
        yAxis: [
          {},
        ],
        grid: [
          {
            bottom: '20px'
          },
          {
            top: '0px'
          }
        ],
        series: [
          {
            type: 'line',
            showSymbol: true,
            data: valueList
          },
        ]
      });
      pmCharts = echarts.init(document.getElementById("iot-system-pm"));
      pmCharts.setOption({
        title: {
          text: '内存使用占比',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: [
              { value: 0, name: '已使用' },
              { value: 0, name: '未使用' },
            ],
            avoidLabelOverlap: false,
            label: {
              //echarts饼图内部显示百分比设置
              show: true,
              position: "outside", //outside 外部显示  inside 内部显示
              formatter: `{d}%`,
              color: "#424141", //颜色
              fontSize: 12 //字体大小
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      })

      componentCharts = echarts.init(document.getElementById("iot-server"));
      componentCharts.setOption({
        title: {
          text: 'tcp连接数',
          // left: 'center'
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: []
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value'
        },
        series: []
      });
      health.interval(1500); // 1.5秒钟采集一次
      serverSocket.interval(3000); // 3秒一次
    })

    onUnmounted(() => {
      health.stop(); // 停止
      serverSocket.stop();
    })
    let mdText = ref("");
    return {health, serverSocket, cpuCharts, pmCharts, componentCharts, currentOnlineDto, currentDeviceDto
      , systemHealth, serverHealth, componentHealth, cpuValueList, ComponentColumns, serverComponents, mdText}
  },
  created() {
    this.$http.get('/core/statistics/online').then(({code, data, message}) => {
      if(code == CoreConsts.SuccessCode) {
        this.currentOnlineDto = data;
      } else {
        this.$msg.warn(message);
      }
    });
    this.$http.get('/iot/statistics/device/current').then(({code, data, message}) => {
      if(code == CoreConsts.SuccessCode) {
        this.currentDeviceDto = data;
      } else {
        this.$msg.warn(message);
      }
    })
  },
  activated() {
    this.health.start(); // 启用
    this.serverSocket.start();
  },
  deactivated() {
    this.health.suspend(); // 暂停
    this.serverSocket.suspend();
  }
}
</script>

<style scoped>
.u-core-index {

}
.u-row {
  margin: 8px 8px 16px;
}
.u-col-statistic {
  width: 228px;
  padding: 16px;
  text-align: center;
  background: #ffffff;
}
.iot-system-profile .ant-card-grid {
  padding: 8px;
}
</style>
