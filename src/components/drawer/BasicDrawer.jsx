import {defineComponent, inject, provide, ref} from "vue";
import {LinkViewContextKey, LinkViewPosition, PositionConst, VisibleContextKey} from "@/utils/ProvideKeys";
import {VisibleContext} from "@/components/view/Context";
import MixinsVisible from "@/components/mixins/MixinsVisible";

export default defineComponent({
    name: 'UDrawer',
    props: {
        title: String,
        bodyStyle: Object,
        centered: Boolean,
        afterClose: Function,
        width: {default: 680},
        height: {default: 452},
        zIndex: {default: 1000},
        keyboard: {default: true},
        closable: {default: true},
        forceRender: {default: false},
        placement: {default: 'right'},
        maskClosable: {default: true},
        headerStyle: {type: Object},
        destroyOnClose: {default: false},
        uid: {type: String, required: true},
        modelValue: {type: Object},
        'onUpdate:modelValue': {type: Function},
        footerStyle: {type: Object, default: () => { return {textAlign: 'center'}}}
    },
    mixins: [MixinsVisible],
    setup(props, {attrs}) {
        let formRef = ref(null);
        let visible = ref(false);
        let spinning = ref(false);
        let routerCall = () => null;
        let spinTip = ref("");

        /**
         * @type {LinkContext}
         */
        let linkContext = inject(LinkViewContextKey);
        let visibleContext = new VisibleContext(linkContext);
        if(linkContext) {
            visibleContext.uid = props.uid;
            linkContext.addChildrenContext(visibleContext);
        }

        provide(VisibleContextKey, visibleContext);
        provide(LinkViewPosition, PositionConst.Drawer);

        // 暴露EditContext
        if(attrs['onUpdate:context'] instanceof Function) {
            attrs['onUpdate:context'](visibleContext);
        }
        return {formRef, spinning, spinTip, visible, routerCall, linkContext, visibleContext}
    },
    render() {
        return(<ADrawer v-model={[this.visible, 'open', ["modifier"]]} rootClassName="u-drawer u-basic-drawer"
                {...this.$props} v-slots={this.$slots} getContainer=".u-main-task" rootStyle={{position: 'absolute'}}/>)
    },
    mounted() {
        this.routerCall = this.$router.beforeEach((from, to, next) => {
            if(this.visible) {
                this.visible = false;
            }

            next();
        })
    },
    unmounted() {
        this.routerCall();
    }
})

