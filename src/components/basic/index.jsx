import {computed, defineComponent, inject, mergeProps, provide, ref} from "vue";
import {FuncContextKey, RowContextKey} from "@/utils/ProvideKeys";
import {msgError} from "@/utils/message";
import {Config, DetailContext, EditContext, FuncConfig, SearchContext, TableContext} from "@/components/view/Context";
import {mapGetters} from "vuex";
import CoreConsts from "@/components/CoreConsts";
import {useRouter} from "vue-router";
import {InboxOutlined} from "@ant-design/icons-vue";
import {UploadDragger} from "ant-design-vue";
import SysUtils from "@/utils/SysUtils";
import {GET} from "@/utils/request";

export const URow = defineComponent({
    name: 'URow',
    props: ['col'],
    setup({col}) {
        let colConfig = col
        if(typeof col == 'string') {
            colConfig = {...CoreConsts.TypeColConfig[col]};
        }

        provide(RowContextKey, colConfig || {});
    },
    render() {
        return <ARow {...this.$attrs} v-slots={this.$slots} class="u-row" />
    }
})

function funcClickHandle(context, config) {
    if(context != null) {
        let $view = context.get$View();

        let childFunc = config.funcPath[1]; // 子功能
        switch (config.func) {
            case CoreConsts.FuncNameMeta.ADD:
                // 新增子记录功能
                if(childFunc == CoreConsts.ChildFuncNameMeta.CHILD) {
                    return $view.openForChild(config);
                }
                return $view.openForAdd(config);
            case CoreConsts.FuncNameMeta.DEL:
                return $view.del(config);
            case CoreConsts.FuncNameMeta.EDIT:
                if(childFunc == CoreConsts.ChildFuncNameMeta.SET) { // 设置
                    return $view.openForSet(config);
                } else if(childFunc == CoreConsts.ChildFuncNameMeta.LOADING) { // 加载数据
                    return $view.openForLoading(config);
                } else {
                    return $view.openForEdit(config);
                }
            case CoreConsts.FuncNameMeta.DETAIL:
                return $view.detail(config);
            case CoreConsts.FuncNameMeta.QUERY:
                return $view.query(config);
            case CoreConsts.FuncNameMeta.CANCEL:
                return $view.cancel(config);
            case CoreConsts.FuncNameMeta.RESET:
                if(context instanceof EditContext) {
                    return $view.resetEditModel(config);
                } else if(context instanceof SearchContext) {
                    return $view.resetSearchModel(config)
                } else {
                    return console.error(`[reset]功能不支持上下文[${context}]只支持[EditContext、SearchContext]`);
                }
            case CoreConsts.FuncNameMeta.SUBMIT:
                return $view.submit(config);
            case CoreConsts.FuncNameMeta.EXPAND:
                return $view.expanded(config); // 展开所有行
            case CoreConsts.FuncNameMeta.IMPORT:
                return $view.excelImport(config);
            case CoreConsts.FuncNameMeta.EXPORT:
                return $view.excelExport(config);
            case CoreConsts.FuncNameMeta.AJAX:
                return $view.otherFuncAjax(config);
            case CoreConsts.FuncNameMeta.DOWNLOAD:
                return $view.download(config);
            case CoreConsts.FuncNameMeta.OPEN:
                return $view.openForVisible(config);
            case CoreConsts.FuncNameMeta.LINK:
                return $view.linkTo(config);
            default: // 其他功能操作
                return console.warn(`不支持的功能[${config.func}]`)
        }
    }
}

export const UFuncTag = defineComponent({
    name: 'UTag', // 别名 UFuncTag
    props: {
        url: String,
        uid: String,
        color: String,
        onClick: Function, // 自定义单击处理
        callback: Function,
        data: {type: Object}, // 行数据
        method: {type: String},
        params: {default: null},
        reload: {default: true}, // 重新加载列表
        disabled: {default: false}, // 是否禁用
        config: {type: Object, default: () => { return {}}}, // 配置
        func: {type: String, required: true}, // add, del, edit, query, import, export, cancel, detail, reset, expand, ...
    },
    setup(props) {
        let router = useRouter();
        let instance = ref(null);
        let funcPath = ref(props.func.toUpperCase().split(":"));

        /**
         * @type {DetailContext | EditContext | TableContext | SearchContext}
         */
        let context = inject(FuncContextKey);

        let disabled = computed(() => {
            if(typeof props.disabled == 'function') {
                return props.disabled(props.data);
            } else {
                return props.disabled === true;
            }
        });

        let typeCompute = computed(() => props.func.split(":")[0].toUpperCase())

        let funcConfig = new FuncConfig(props, context, funcPath.value);
        let clickProxy = funcConfig.trigger = (e) => {
            if(!disabled.value) {
                // 配置对象只能在触发事件内创建
                let config = new Config(instance.value).build(props, context, router, funcConfig);
                if(props.onClick instanceof Function) {
                    props.onClick({data: props.data, event: () => funcClickHandle(context, config)})
                } else {
                    if(context != null) {
                        funcClickHandle(context, config)
                    } else {
                        console.warn("无效的操作(需要自定义事件或者在指定的组件下面)")
                    }
                }
            }
        }

        // 注册功能点
        context.getLinkContext().registerFunc(funcConfig);

        /**
         * @type {ViewContext}
         */
        let viewContext = context.get$View().getViewContext();
        return {clickProxy, context, typeCompute, viewContext, disabled, funcPath, instance};
    },
    computed: {
        ...mapGetters({
            auth: 'sys/authMenuMap'
        }),
        tagColor() {
            let func = this.funcPath[0];
            return this.color || CoreConsts.FuncTagColorMaps[func] || 'blue'
        }
    },
    render() {
        this.instance = this;
        let tagColor = this.disabled ? '#d8d8d8' : this.tagColor;
        let disabledClass = this.disabled ? 'ivz-func-disabled' : 'ivz-func-tag'
        return <ATag closable={false} class={disabledClass} class="u-func" bordered={false}
                     color={tagColor} onClick={this.clickProxy} v-slots={this.$slots} />
    },
    deactivated() {
        if(this['modalRef']) {
            this['modalRef'].destroy();
        }
    },
    methods: {
        trigger() {
            this.clickProxy();
        },
    }
})

/**
 * 功能按钮, 可以指定url, 功能类型
 * 注：只适用于编辑组件包括不限于(搜索组件, 编辑组件)等编辑组件
 * @type {DefineComponent<{func: {default: string, type: StringConstructor}, meta: {default: (function(): {}), type: ObjectConstructor}, url: {type: StringConstructor}}, unknown, unknown, {typeCompute(): *}, {}, ComponentOptionsMixin, ComponentOptionsMixin, Record<string, any>, string>}
 */
export const UFuncBtn = defineComponent({
    name: 'UButton', // 别名 UFuncBtn
    props: {
        uid: String, // 要操作的uid
        onClick: Function,
        callback: Function,
        url: {type: String}, // 功能地址
        data: {type: Object},
        params: {default: null},
        reload: {default: true}, // 重新加载列表
        disabled: {type: Boolean, default: false},
        method: {type: String, default: null}, // 请求方法
        config: {type: Object, default: () => { return {}}}, // 配置
        func: {type: String, required: true, default: ''},  // add, del, edit, query, import, export, cancel, detail, reset
    },
    setup(props, {attrs}) {
        let router = useRouter();
        let instance = ref(null);
        let funcPath = ref(props.func.toUpperCase().split(":"));

        /**
         * @type {EditContext | SearchContext | DetailContext | SearchContext}
         */
        let context = inject(FuncContextKey);
        let funcConfig = new FuncConfig(props, context, funcPath.value);

        let clickProxy = {onClick: (e) => {
                // 配置对象只能在触发事件内创建
                let config = new Config(instance.value).build(props, context, router, funcConfig);
                if(props.onClick instanceof Function) {
                    props.onClick({data: props.data, event: () => funcClickHandle(context, config)})
                } else if(context != null) {
                    funcClickHandle(context, config)
                }else {
                    console.warn(`无效的操作(需要自定义事件或者在指定的组件下面)`)
                }
            }
        }

        let loading = ref(false);

        funcConfig.trigger = clickProxy.onClick;
        funcConfig.setLoading = status => loading.value = status;
        context.getLinkContext().registerFunc(funcConfig)

        let viewContext = context.get$View().getViewContext();
        return {clickProxy, context, loading, viewContext, instance, funcPath};
    },
    computed: {
        ...mapGetters({
            auth: 'sys/authMenuMap'
        })
    },
    render() {
        this.instance = this;
        return <AButton {...this.handleProps()} disabled={this.disabled} v-slots={this.$slots} style="margin: 0px 3px" loading={this.loading} />
    },
    methods: {
        trigger() {
            this.clickProxy.onClick(null);
        },
        handleProps() {
            let type = CoreConsts.FuncBtnTypeMaps[this.funcPath[0]];
            return mergeProps(type, this.clickProxy, this.$attrs);
        }
    }
})

export const UTree = defineComponent({
    name: 'UTree',
    props: {
        url: {type: String}, // 数据地址
        field: {type: String, default: null},
        checkable: {type: Boolean, default: false},
        checkedKeys: {type: Array},
        'onUpdate:checkedKeys': {type: Function},
        selectable: {type: Boolean, default: false},
        selectedKeys: {type: Array},
        'onUpdate:selectedKeys': {type: Function},
        defaultExpandAll: {type: Boolean, default: false},
        fieldNames: {type: Object, default: () => {return {key: CoreConsts.DefaultRowKey, title: 'name', children:'children', level: null}}}
    },
    setup(props, {attrs}) {
        let allKeys = ref([]);
        let treeData = ref([]);
        let treeDataMap = ref({});
        let expandedKeys = ref([]);
        let selectedKeys = ref([]);

        let checkedKeysRef = props.checkedKeys
            , onCheckedKeys = props["onUpdate:checkedKeys"]
            , selectedKeysRef = props.selectedKeys
            , onSelectedKeys = props["onUpdate:selectedKeys"]
            , formContext;
        if(props.field) {
            let field = props.field.split(".");
            formContext = inject('formContext');

            if(props.checkable) {
                checkedKeysRef = computed(() => formContext.getFieldValue(field));
                onCheckedKeys = (value) => {
                    formContext.setFieldValue(field, value)
                    if(props['onUpdate:checkedKeys'] instanceof Function) {
                        props['onUpdate:checkedKeys'](value);
                    }
                }
            }
            if(props.selectable) {
                selectedKeysRef = computed(() => formContext.getFieldValue(field));
                onSelectedKeys = (value) => {
                    formContext.setFieldValue(field, value);
                    if(props['onUpdate:selectedKeys'] instanceof Function) {
                        props['onUpdate:selectedKeys'](value);
                    }
                }
            }
        }

        return {allKeys, treeData, selectedKeys, expandedKeys, checkedKeysRef, onCheckedKeys
            , formContext, selectedKeysRef, onSelectedKeys, treeDataMap}
    },
    watch: {
        url(newUrl) {
            this.loadingInitData(newUrl)
        },
    },
    created() {
        if(this.url) {
            this.loadingInitData(this.url);
        }
    },
    render() {
        return <ATree {...this.$attrs} checkable={this.checkable} selectable={this.selectable}
                      v-models={[[this.expandedKeys, 'expandedKeys', ["modifier"]]]}
                      checkedKeys={this.checkedKeysRef} onUpdate:checkedKeys={this.onCheckedKeys}
                      selectedKeys={this.selectedKeysRef} onUpdate:selectedKeys={this.onSelectedKeys}
                      treeData={this.treeData} fieldNames={this.fieldNames} defaultExpandAll={this.defaultExpandAll}>
        </ATree>
    },
    methods: {
        loadingInitData(dataUrl) {
            this.$http.get(dataUrl).then(({code, message, data}) => {
                if(code == CoreConsts.SuccessCode) {
                    this.treeData = data;
                    this.initAllKeys(data);
                    if(this.defaultExpandAll) {
                        this.setExpandedAllKeys();
                    }
                } else {
                    msgError(message);
                }
            }).catch(reason => console.error(reason));
        },
        /**
         * @returns {Array}
         */
        getSelectedKeys() {
            return this.selectedKeys;
        },
        /**
         * 选中的所有值
         * @returns {*[]}
         */
        getSelectedValues() {
          return this.selectedKeys.map(key => this.treeDataMap[key]);
        },
        setSelectedKeys(selectedKeys) {
            this.selectedKeys = selectedKeys;
        },
        /**
         * @returns {Array}
         */
        getCheckedKeys() {
            return this.checkedKeys;
        },
        /**
         * 选中的所有值
         * @returns {*[]}
         */
        getCheckedValues() {
            return this.checkedKeys.map(key => this.treeDataMap[key]);
        },
        setCheckedKeys(checkedKeys) {
            this.checkedKeys = checkedKeys;
        },
        /**
         * 返回key对应的值
         * @param key
         * @returns {*}
         */
        getValueByKey(key) {
            return this.treeDataMap[key];
        },
        getAllKeys() {
          return this.allKeys;
        },

        setFieldValue(values) {
            /**
             * @type {FormContext}
             */
            let formContext = this.formContext;
            if(formContext != null) {
                formContext.setFieldValue([this.field], values);
            }
        },
        getExpandedKeys() {
            return this.expandedKeys;
        },

        /**
         * 设置展开的行的key
         * @param expandedKeys
         */
        setExpandedKeys(expandedKeys) {
            this.expandedKeys = expandedKeys;
        },
        setExpandedAllKeys() {
            this.expandedKeys = this.allKeys;
        },
        initAllKeys(data) {
            if(data instanceof Array) {
                data.forEach(item => {
                    let keyValue = item[this.fieldNames.key];
                    this.allKeys.push(keyValue);
                    this.treeDataMap[keyValue] = item;
                    let children = item[this.fieldNames.children];
                    if(children instanceof Array) {
                        this.initAllKeys(children);
                    }
                })
            }
        }
    }
})
export const ImportUpload = defineComponent({
    components: {InboxOutlined, UploadDragger},
    render() {
        let templateUrl = this.$attrs.templateUrl;
        return (<div>
            <UploadDragger {...this.$attrs}>
                <p class="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p class="import-upload-text">点击或者拖拽excel文件到此区域</p>
            </UploadDragger>
            <p className="import-upload-template" style="padding: 12px 0px 0px">
                <a href={templateUrl}>点击下载模板</a>
            </p>
        </div>)
    },
    methods: {
        downloadTemplate() {
            let templateUrl = this.$attrs.templateUrl;
            let config = {responseType: 'blob'}; config[CoreConsts.CancelRespResolver] = true;
            GET(templateUrl, null).then(resp => {
                let {data, headers} = resp;

                // let header = headers["content-disposition"];
                // contentType = contentType || headers['content-type'] || 'application/octet-stream';
                // fileName = fileName || (header ? decodeURI(header.split("filename=")[1]) : console.warn("未指定文件名"));
                // SysUtils.downloadFile(data, contentType, fileName)
            })
        },
        handleDrop() {

        },
        handleChange() {

        }
    }
})
/**
 * 只有两列的ARow
 */
export const U2Col = defineComponent({
    name: 'U2Col',
    props: {
        gutter: {type: Number, default: 8}
    },
    render() {
        return (<ARow {...this.$attrs} gutter={this.gutter} class="iv-row iv-u2col-row">
            <ACol class="iv-col iv-col-left" xs={0} sm={0} md={8} lg={6} xl={6}>
                {this.$slots.left ? this.$slots.left() : []}
            </ACol>
            <ACol class="iv-col iv-col-right" xs={24} sm={24} md={16} lg={18} xl={18}>
                {this.$slots.right ? this.$slots.right() : []}
            </ACol>
        </ARow>)
    },
})
export default {
    install(app) {
        app.component(URow.name, URow)
        app.component(UTree.name, UTree)
        app.component(U2Col.name, U2Col)
        app.component(UFuncBtn.name, UFuncBtn)
        app.component(UFuncTag.name, UFuncTag)
        app.component("UFuncBtn", UFuncBtn)
        app.component("UFuncTag", UFuncTag)
    }
}
