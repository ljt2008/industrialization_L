<template>
  <a-layout-sider class="u-sider" :width="238" breakpoint="lg" :trigger="null"
      :collapsed="sys.collapsed" collapsible:collapsedWidth="68" theme="dark">
    <!--侧边菜单-->
    <div class="u-sider-menu">
      <!-- 顶部logo -->
      <div class="iv-header u-logo iv-primary-divider" style="background-color: #001529;">
          <a-avatar :size="36" :src="sysLogo" class="my-avatar"></a-avatar>
          <span class="u-logo-title" style="color: #fff;">{{sysName}}</span>
      </div>
      <!-- 动态导航栏    ---   important -->
      <!-- menu.type是V -- 最后一层 M 还有children -->
      <a-menu @select="selectMenu" mode="inline" :openKeys="openKeys"
              :selectedKeys="sys.selectedKeys" @openChange="openChange" theme="dark">
        <template v-for="menu in menus">
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
      console.log(menu)
      //key 就是路由路径
      this.$router.push(menu.key).then(() => {
        //说实话，这个函数我也没太看懂   貌似删了问题也不大   貌似就是利用一个变量记录一下此时这个路由url   还是不注释掉了
        this.switchActiveMenuTo(menu.key);
      }).catch(reason => console.error(`路由跳转失败[${reason}]`))
    },

    // SubMenu 展开/关闭的回调   就是每个有children的menu点击后的回调 
    openChange(openKeys) {
      console.log(openKeys)
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
