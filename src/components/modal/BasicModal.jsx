import {defineComponent, inject, ref} from "vue";
import {LinkViewContextKey} from "@/utils/ProvideKeys";
import MixinsEditItem from "@/components/edit/MixinsEditItem";
import {VisibleContext} from "@/components/view/Context";
import CoreConsts from "@/components/CoreConsts";

export default defineComponent({
  name: 'UModal',
  props: {
    uid: {type: String, required: true, default: CoreConsts.DefaultEditUid}
  },
  mixins: [MixinsEditItem],
  setup(props, {attrs, slots}) {
    let refs = ref(null);
    let visible = ref(false);

    /**
     * @type {LinkContext}
     */
    let linkContext = inject(LinkViewContextKey);
    let editContext = new VisibleContext(linkContext);
    if(linkContext) {
      editContext.uid = props.uid;
      linkContext.addChildrenContext(editContext)
    }

    // 暴露EditContext
    if(attrs['onUpdate:context'] instanceof Function) {
      attrs['onUpdate:context'](editContext);
    }
    return {refs, visible, editContext}
  },
  render() {
    return <AModal {...this.$attrs} v-model={[this.visible, 'open', ["modifier"]]} v-slots={this.$slots} />
  }
})
