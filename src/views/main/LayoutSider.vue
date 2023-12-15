<template>
  <a-layout-sider class="u-sider" :width="238" breakpoint="lg" :trigger="null"
      v-model:collapsed="sys.collapsed" collapsible :collapsedWidth="68" :theme="themeConfig.style">
    <!--侧边菜单-->
    <div class="u-sider-menu">
      <!-- 顶部logo -->
      <div class="iv-header u-logo iv-primary-divider">
          <a-avatar :size="36" :src="sysLogo"></a-avatar>
          <span class="u-logo-title">{{sysName}}</span>
      </div>
      <!-- 动态导航栏 -->
      <a-menu @select="selectMenu" mode="inline" :openKeys="openKeys"
              :selectedKeys="sys.selectedKeys" @openChange="openChange" :theme="themeConfig.style">
        <template v-for="menu in menus">
          <template v-if="menu.type=='V'">
            <a-menu-item :key="menu.url">
              <UIcon class="iv-menu-icon" :type="menu.icon || 'iz-icon-icon'" />
              <span class="u-level-title">{{menu.name}}</span>
            </a-menu-item>
          </template>
          <template v-else-if="menu.type=='M'">
            <!--递归的子菜单 ？？？ 好高级的样子-->
            <ivz-sub-menu :menu="menu"/>
          </template>
        </template>
      </a-menu>
    </div>
  </a-layout-sider>
</template>

<script>
import {inject, ref} from "vue";
import IvzSubMenu from '@/views/main/SubMenu.vue'
import {mapGetters, mapMutations} from "vuex";
import {ThemeConfigKey} from "@/utils/ProvideKeys";
import store from "@/store";

export default {
  name: "LayoutSider",
  setup() {
    let themeConfig = inject(ThemeConfigKey);
    let sys = store.state.sys;
    return {themeConfig, sys}
  },
  components: {IvzSubMenu},
  computed: {
    ...mapGetters({
      menus: 'sys/menus',    //系统菜单
      sysName: 'sys/sysName',   //系统名称
      sysLogo: 'sys/sysLogo',   //系统logo
      openKeys: 'sys/openKeys',    //打开的子菜单
      collapsed: 'sys/collapsed',  //？？
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
      this.$router.push(menu.key).then(() => {
        this.switchActiveMenuTo(menu.key);
      }).catch(reason => console.error(`路由跳转失败[${reason}]`))
    },

    // SubMenu 展开/关闭的回调
    openChange(openKeys) {
      if(this.sysMenuLevel == 'one') {
        const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
        if (!this.menus.find(item => item.id == latestOpenKey)) {
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
</style>
