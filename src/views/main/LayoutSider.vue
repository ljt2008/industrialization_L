<template>
  <a-layout-sider class="u-sider" :width="238" breakpoint="lg" :trigger="null"
      :collapsed="sys.collapsed" collapsible:collapsedWidth="68" theme="dark">
    <!--侧边菜单-->
    <div class="u-sider-menu">
      <!-- 顶部logo -->
      <div class="iv-header u-logo iv-primary-divider" style="background-color: #001529;">
          <a-avatar :size="36" :src="sysLogo" class="my-avatar"></a-avatar>
          <span class="u-logo-title" style="color: #fff;">柚见智居
</span>
      </div>
      <!-- 动态导航栏    ---   important -->
      <!-- menu.type是V -- 最后一层 M 还有children -->
      <a-menu @select="selectMenu" mode="inline" :openKeys="openKeys"
              :selectedKeys="sys.selectedKeys" @openChange="openChange" theme="dark">
        <template v-for="menu in myMenus">
          <template v-if="menu.type=='V'">
            <a-menu-item :key="menu.url">
              <UIcon class="iv-menu-icon" :type="menu.icon || 'iz-icon-icon'" />
              <span class="u-level-title">{{menu.name}} + </span>
            </a-menu-item>
          </template>
          <template v-else-if="menu.type=='M'">
            <!--递归的子菜单 ？？？ 好高级的样子    对，就是递归的子菜单-->
            <ivz-sub-menu :menu="menu"/>
          </template>
        </template>
      </a-menu> 
    </div>
  </a-layout-sider>
</template>

<script>
// 其实就是把从vuex中的menu拿出来，然后利用组件递归生成dom树，渲染画面
// 点击事件就是用的组件自带的select组件组件
import {inject, ref} from "vue";
import IvzSubMenu from '@/views/main/SubMenu.vue'
import {mapGetters, mapMutations} from "vuex";
import {ThemeConfigKey} from "@/utils/ProvideKeys";
import store from "@/store";

export default {
  name: "LayoutSider",
  setup() {
    const myMenus = [
      {
        children:[
          {
            children: null,
            createTime: "2023-05-23",
            icon: "iz-icon-device",
            id: 1230,
            msn: "iot",
            name: "设备信息",
            perms: "iot:device:view",
            pid: 1304,
            remark: "",
            section: null,
            sort: 128,
            status: "enabled",
            type: "V",
            updateTime: null,
            url: "/iot/device"
          },
          {
            children: null,
            createTime: "2023-05-23",
            icon: "iz-icon-model",
            id: 1266,
            msn: "iot",
            name: "设备型号",
            perms: "iot:deviceModel:view",
            pid: 1304,
            remark: "",
            section: null,
            sort: 158,
            status: "enabled",
            type: "V",
            updateTime: null,
            url: "/iot/deviceModel"
          },
          {
            children: null,
            createTime: "2023-05-23",
            icon: "iz-icon-type",
            id: 1225,
            msn: "iot",
            name: "设备类型",
            perms: "iot:deviceType:view",
            pid: 1304,
            remark: "",
            section: null,
            sort: 158,
            status: "enabled",
            type: "V",
            updateTime: null,
            url: "/iot/deviceType"
          },
        ],
        createTime: "2023-05-23",
        icon: "iz-icon-basic-config",
        id: 1304,
        msn: "iot",
        name: "智居数字孪生",
        perms: "#",
        pid: 0,
        remark: "",
        section: null,
        sort: 20,
        status: "enabled",
        type: "M",
        updateTime: null,
        url: "#"
      },
      {
        children: [
          // {
          //   children: null,
          //   createTime: "2023-05-23",
          //   icon: "iz-icon-log",
          //   id: 1293,
          //   msn: "iot",
          //   name: "串口设备",
          //   perms: "iot:serial:view",
          //   pid: 1224,
          //   remark: "",
          //   section: null,
          //   sort: 158,
          //   status: "enabled",
          //   type: "V",
          //   updateTime: null,
          //   url: "/iot/serial"
          // },
          // {
          //   children: null,
          //   createTime: "2023-05-23",
          //   icon: "iz-icon-plc",
          //   id: 1235,
          //   msn: "iot",
          //   name: "PLC管理",
          //   perms: "iot:plc:view",
          //   pid: 1224,
          //   remark: "",
          //   section: null,
          //   sort: 200,
          //   status: "enabled",
          //   type: "V",
          //   updateTime: null,
          //   url: "/iot/plc"
          // },
          {
            children: null,
            createTime: "2023-05-23",
            icon: "iz-icon-dtube",
            id: 1237,
            msn: "iot",
            name: "智能家居网关管理",
            perms: "iot:dtu:view",
            pid: 1224,
            remark: "",
            section: null,
            sort: 250,
            status: "enabled",
            type: "V",
            updateTime: null,
            url: "/iot/dtu"
          },
          // {
          //   children: null,
          //   createTime: "2023-05-23",
          //   icon: "iz-icon-modbus",
          //   id: 1282,
          //   msn: "iot",
          //   name: "Modbus管理",
          //   perms: null,
          //   pid: 1224,
          //   remark: "",
          //   section: null,
          //   sort: 280,
          //   status: "enabled",
          //   type: "V",
          //   updateTime: null,
          //   url: "/iot/modbus"
          // },
          {
            children:[
              {
                children: null,
                createTime: "2023-05-23",
                icon: "iz-icon-signal",
                id: 1261,
                msn: "iot",
                name: "点位管理",
                perms: "iot:signal:view",
                pid: 1272,
                remark: "",
                section: null,
                sort: 18,
                status: "enabled",
                type: "V",
                updateTime: null,
                url: "/iot/signal"
              },
              {
                children: null,
                createTime: "2023-05-23",
                icon: "iz-icon-set",
                id: 1256,
                msn: "iot",
                name: "点位组管理",
                perms: "iot:pointGroup:view",
                pid: 1272,
                remark: "",
                section: null,
                sort: 58,
                status: "enabled",
                type: "V",
                updateTime: null,
                url: "/iot/pointGroup"
              },
              {
                children: null,
                createTime: "2023-05-23",
                icon: "iz-icon-collect-task",
                id: 1275,
                msn: "iot",
                name: "采集任务管理",
                perms: "iot:collectTask:view",
                pid: 1272,
                remark: "",
                section: null,
                sort: 158,
                status: "enabled",
                type: "V",
                updateTime: null,
                url: "/iot/collectTask"
              },
              {
                children: null,
                createTime: "2023-05-23",
                icon: "iz-icon-quartz",
                id: 1288,
                msn: "iot",
                name: "采集数据列表",
                perms: "iot:collectData:view",
                pid: 1272,
                remark: "",
                section: null,
                sort: 188,
                status: "enabled",
                type: "V",
                updateTime: null,
                url: "/iot/collectData"
              }
            ],
            createTime: "2023-05-23",
            icon: "iz-icon-collect",
            id: 1272,
            msn: "iot",
            name: "智能家居数据采集",
            perms: null,
            pid: 1224,
            remark: "",
            section: null,
            sort: 300,
            status: "enabled",
            type: "M",
            updateTime: null,
            url: "#"
          },
          // {
          //   children: [
          //     {
          //       children: null,
          //       createTime: "2023-05-23",
          //       icon: "iz-icon-menu",
          //       id: 1274,
          //       msn: "iot",
          //       name: "DTU模拟",
          //       perms: null,
          //       pid: 1273,
          //       remark: "",
          //       section: null,
          //       sort: 20,
          //       status: "enabled",
          //       type: "V",
          //       updateTime: null,
          //       url: "/iot/simulator/dtu"
          //     },
          //     {
          //       children: null,
          //       createTime: "2023-05-23",
          //       icon: "iz-icon-debug-tools",
          //       id: 1255,
          //       msn: "iot",
          //       name: "网络调试",
          //       perms: "",
          //       pid: 1273,
          //       remark: "",
          //       section: null,
          //       sort: 300,
          //       status: "enabled",
          //       type: "V",
          //       updateTime: null,
          //       url: "/iot/debug"
          //     }
          //   ],
          //   createTime: "2023-05-23",
          //   icon: "iz-icon-debug",
          //   id: 1273,
          //   msn: "iot",
          //   name: "调试工具",
          //   perms: null,
          //   pid: 1224,
          //   remark: "",
          //   section: null,
          //   sort: 320,
          //   status: "enabled",
          //   type: "M",
          //   updateTime: null,
          //   url: "#"
          // }
        ],
        createTime: "2023-05-23",
        icon: "iz-icon-iiot",
        id: 1224,
        msn: "iot",
        name: "智居数据管理",
        perms: null,
        pid: 0,
        remark: "",
        section: null,
        sort: 30,
        status: "enabled",
        type: "M",
        updateTime: null,
        url: "#"
      },
      {
        children: null,
        createTime: "2023-05-23",
        icon: "iz-icon-sys-monitor",
        id: 1200,
        msn: "iot",
        name: "智能家居数据分析",
        perms: null,
        pid: 1200,
        remark: "",
        section: null,
        sort: 30,
        status: "enabled",
        type: "M",
        updateTime: null,
        url: "#"
      }
    ];
    let themeConfig = inject(ThemeConfigKey);
    let sys = store.state.sys;
    return {themeConfig, sys, myMenus}
  },
  components: {IvzSubMenu},
  computed: {
    ...mapGetters({
      menus: 'sys/menus',    //系统菜单
      sysName: 'sys/sysName',   //系统名称
      sysLogo: 'sys/sysLogo',   //系统logo
      openKeys: 'sys/openKeys',    //打开的子菜单
      collapsed: 'sys/collapsed',  // 是否折叠菜单（移动端适配）
      taskBarData: 'sys/taskBarData',  //任务栏打开的人物列表
      sysMenuLevel: 'sys/sysMenuLevel',  //菜单展开级别，默认是1级
      selectedKeys: 'sys/selectedKeys',  //选中的菜单
    }),
  },
  methods: {
    ...mapMutations({
      pushAndSwitchTask: 'sys/pushAndSwitchTask',

      // pushAndSwitchTask: (state, url) => {
      //           let route = state.urlRouteMaps[url];
      //           if(route == null) {
      //               return console.error(`url[${url}]对应的路由不存在`)
      //           }

      //           router.push(route).then(() => {
      //               store.commit('sys/switchActiveMenuTo', url)
      //           }).catch(reason=> {
      //               console.error(`切换任务失败(组件异常或组件不存在或未注册路由)[${reason}]`)
      //           });
      //       },
      switchActiveMenuTo: 'sys/switchActiveMenuTo',

      // switchActiveMenuTo: (state, url) => {
      //           let menu = state.urlMenuMaps[url];

      //           if(menu) {
      //               state.activeMenu = menu;

      //               state.selectedKeys.length = 0;
      //               state.selectedKeys.push(menu.url);
      //           } else {
      //               state.activeMenu = null;
      //               state.selectedKeys.length = 0;
      //           }
      //       },
      switchOpenSubMenuTo: 'sys/switchOpenSubMenuTo'
          // switchOpenSubMenuTo: (state, openKeys) => {
          //       state.openKeys = openKeys
          //   },
    }),

    // 点击跳转
    selectMenu(menu) {
      //key 就是路由路径
      this.$router.push(menu.key).then(() => {
        //说实话，这个函数我也没太看懂   貌似删了问题也不大   貌似就是利用一个变量记录一下此时这个路由url   还是不注释掉了
        this.switchActiveMenuTo(menu.key);
      }).catch(reason => console.error(`路由跳转失败[${reason}]`))
    },

    // SubMenu 展开/关闭的回调   就是每个有children的menu点击后的回调 
    openChange(openKeys) {
      console.log(openKeys)
      console.log('menus', this.menus)
      if(this.sysMenuLevel == 'one') {
        const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
        if (!this.myMenus.find(item => item.id == latestOpenKey)) {
          this.switchOpenSubMenuTo(openKeys);
        } else {
          this.switchOpenSubMenuTo(latestOpenKey ? [latestOpenKey] : []);
        }
      } else {
        this.switchOpenSubMenuTo(openKeys);
      }
    },
  }
}
</script>

<style>
.u-logo {
    height: var(--header-height);
    line-height: var(--header-height);
    overflow: hidden;
    text-align: center;
    white-space: nowrap;
    text-overflow:ellipsis;
    vertical-align: middle;
    color: var(--header-color);
    background-color: var(--header-logo-background-color);
    margin-bottom: 0;
    border-bottom: 0;
}
.u-logo-title {
    font-size: 18px;
    margin-left: 8px;
    vertical-align: bottom;
}
.ant-layout-sider-collapsed .u-logo-title {
    display: none;
}
.ant-layout-sider-dark .u-logo-title {
    color: #ffffff;
}
.u-sider .ant-layout-sider-children {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.u-sider .u-sider-menu {
  flex-grow: 1;
  overflow: hidden auto;
}
/*侧边菜单栏滚动条样式*/
.u-sider .ant-layout-sider-collapsed .ant-menu-inline-collapsed {
  width: 72px;
}
.u-sider .ant-layout-sider-children ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.my-avatar{
  border-radius: 0;
}
</style>
