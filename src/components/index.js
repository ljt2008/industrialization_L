import './index.css'
import UForm from '@/components/form/basic/Form'
import IvzViewComponents from '@/components/view'
import IvzBasicComponents from '@/components/basic'
import UBasicFormComponents from "@/components/form/basic/index.jsx";
import UBasicFormItemComponents from "@/components/form/basic/formItem.jsx";

import UTable from "@/components/table/BasicTable.jsx";
import USearch from "@/components/search/BasicSearch.vue";
import UFormModal from "@/components/modal/FormModal.jsx";
import UFormDrawer from "@/components/drawer/FormDrawer.jsx";
import UBasicDrawer from "@/components/drawer/BasicDrawer.jsx";

import UCropper from '@/components/cropper/ImageCropper.vue';

export default {
    install(app) {
        app.use(IvzViewComponents) // 视图组件
        app.use(IvzBasicComponents) // 基础组件
        app.use(UBasicFormComponents) // 表单组件
        app.use(UBasicFormItemComponents) // 表单项组件

        app.component(UForm.name, UForm)
        app.component(UTable.name, UTable)
        app.component(UCropper.name, UCropper)
        app.component(UFormModal.name, UFormModal)
        app.component(UFormDrawer.name, UFormDrawer)
        app.component(UBasicDrawer.name, UBasicDrawer)
        app.component(USearch.name, USearch)
    }
}
