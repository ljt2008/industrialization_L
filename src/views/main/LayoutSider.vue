<template>
  <a-layout-sider class="u-sider" :width="238" breakpoint="lg" :trigger="null"
      v-model:collapsed="sys.collapsed" collapsible :collapsedWidth="68" :theme="themeConfig.style">
    <!--侧边菜单-->
    <div class="u-sider-menu">
      <div class="iv-header u-logo iv-primary-divider">
          <a-avatar :size="36" :src="sysLogo"></a-avatar>
          <span class="u-logo-title">{{sysName}}</span>
      </div>
      <a-menu @select="selectMenu" mode="inline" :openKeys="openKeys"
              v-model:selectedKeys="sys.selectedKeys" @openChange="openChange" :theme="themeConfig.style">
        <template v-for="menu in menus">
          <template v-if="menu.type=='V'">
            <a-menu-item :key="menu.url">
              <UIcon class="iv-menu-icon" :type="menu.icon || 'iz-icon-icon'" />
              <span class="u-level-title">{{menu.name}}</span>
            </a-menu-item>
          </template>
          <template v-else-if="menu.type=='M'">
            <!--递归的子菜单-->
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
import {MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons-vue";

export default {
  name: "LayoutSider",
  setup() {
    let themeConfig = inject(ThemeConfigKey);
    let sys = store.state.sys;
    return {themeConfig, sys}
  },
  components: {IvzSubMenu, MenuFoldOutlined, MenuUnfoldOutlined},
  computed: {
    ...mapGetters({
      menus: 'sys/menus',
      sysName: 'sys/sysName',
      sysLogo: 'sys/sysLogo',
      openKeys: 'sys/openKeys',
      collapsed: 'sys/collapsed',
      taskBarData: 'sys/taskBarData',
      sysMenuLevel: 'sys/sysMenuLevel',
      selectedKeys: 'sys/selectedKeys',
    }),
  },
  methods: {
    ...mapMutations({
      pushAndSwitchTask: 'sys/pushAndSwitchTask',
      switchActiveMenuTo: 'sys/switchActiveMenuTo',
      switchOpenSubMenuTo: 'sys/switchOpenSubMenuTo'
    }),
    selectMenu(menu) {
      this.$router.push(menu.key).then(() => {
        this.switchActiveMenuTo(menu.key);
      }).catch(reason => console.error(`路由跳转失败[${reason}]`))
    },

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
