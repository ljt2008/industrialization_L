<template>
  <a-form
    layout="vertical"
    :model="user"
    name="basic"
    :label-col="{ span: 10}"
    :wrapper-col="{ span: 30 ,offset: 0}"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
  >
    <a-form-item
      label="用户名"
      name="username"
      :rules="[{ required: true, message: '请输入用户名！' }]"
    >
      <!-- <i>用户名：</i> -->
      <a-input v-model:value="user.username" />
    </a-form-item>

    <a-form-item
      label="密码"
      name="password"
      :rules="[{ required: true, message: '请输入密码！' }]"
    >
      <a-input-password v-model:value="user.password" />
    </a-form-item>

    <a-form-item
      label="验证码"
      name="captcha"
      :rules="[{ required: true, message: '请输入验证码！' }]"
      class="captcha-item"
    >
      <a-input v-model:value="user.captcha" style="width: 50%;"/>
      <img v-if="loginModel.captchaImg" @click="clickImg" :src="loginModel.captchaImg" class="captcha-img"/>
    </a-form-item>

    <a-form-item :wrapper-col="{ offset: 0, span: 30 }" style="margin-top: 15px;">
      <a-button :loading="loginModel.loading" @click="submit" type="primary" html-type="submit" style="width: 100%;" >登录</a-button>
    </a-form-item>
    <div class="login-err">{{loginModel.errMsg}}</div>
    <div class="my-bottom-logo"></div>
  </a-form>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import {Form} from 'ant-design-vue'
import {getCode, login, oauth2, captchaUri} from '../../../api'
import CoreConsts from "../../../components/CoreConsts";
import router from '../../../router';
const user = reactive({
      code: null,
      captcha: null,
      username: 'admin',
      password: 'admin123456'
    });

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};


const loginModel = reactive({
  loading: false,
  errMsg: '',
  izCaptcha: false,
  captchaImg: null,
  class: 'iz-login-tip-error'
});

/*
validateInfos: 表单验证信息，包含了各个表单项的验证状态。
validate: 用于触发整个表单的验证。
validateField: 用于触发单个表单项的验证。
 */
const {validateInfos, validate, validateField} = Form.useForm(user);

//得到 message code data
const clickImg = () => {
  getCode().then(({message, code, data}) => {
    if(code == CoreConsts.SuccessCode) {
      user.code = data;
      loginModel.captchaImg = captchaUri + '?code=' + data;
    } else {
      loginModel.errMsg = message;
    }
  })
}

clickImg();

const oauth2Login = (type) => {
  oauth2(type)
}
const submit = () => {
  validate().then(res => {
    loginModel.loading = true;
    login(user).then(({data: {code, message}, headers})=>{
      if(code == CoreConsts.SuccessCode) {
        // header存在token, 将他保存到Storage
        let accessToken = headers[CoreConsts.AccessToken];
        if(accessToken) {
          localStorage.setItem(CoreConsts.AccessToken, accessToken)
        } else { // 移除存储在本地的token
          localStorage.removeItem(CoreConsts.AccessToken);
        }
        router.push("/");
      } else {
        clickImg();
        loginModel.errMsg = message;
      }
    }).catch(reason => {
      clickImg();
    }).finally(() => loginModel.loading = false);
  })
}
</script>
<style scoped>
.ant-form {
  height: 350px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}


/* y验证码 */
.captcha-img {
  height: 100%;
  width: 40%;
  margin-left: 5%;
  vertical-align: top;
}

.login-err {
  color: #ed4014;
  margin: auto;
  margin-top: -17px;
}
.ant-form {
  display: flex;
  justify-content: space-between;
}
</style>