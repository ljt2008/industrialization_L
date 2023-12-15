<template>
    <div class="bgc">
      <div :class="['login-container']">
        <div class="button-wrapper"></div>
        <div class="login-wrapper">
          <h1>欢迎回来</h1>
          <a-form
          :model="user"
          name="basic"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 11 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
        >
          <a-form-item
            label="用户名"
            name="username"
            :rules="[{ required: true, message: '请输入用户名！' }]"
          >
            <a-input v-model:value="user.username" />
          </a-form-item>

          <a-form-item
            label="密&nbsp&nbsp&nbsp&nbsp码"
            name="password"
            :rules="[{ required: true, message: '请输入密码！' }]"
          >
            <a-input-password v-model:value="user.password" />
          </a-form-item>

          <a-form-item
            label="验证码"
            name="captcha"
            :rules="[{ required: true, message: '请输入验证码！' }]"
          >
            <a-input v-model:value="user.captcha" style="width: 40%;"/>
            <img v-if="loginModel.captchaImg" @click="clickImg" :src="loginModel.captchaImg" class="captcha-img"/>
          </a-form-item>

          <a-form-item :wrapper-col="{ offset: 4, span: 16 }" style="margin-top: 15px;">
            <a-button :loading="loginModel.loading" @click="submit" type="primary" html-type="submit" style="width: 100%;" >登录</a-button>
          </a-form-item>
          <div class="login-err">{{loginModel.errMsg}}</div>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {Form} from 'ant-design-vue'
import {getCode, login, oauth2, captchaUri} from '../../api'
import CoreConsts from "../../components/CoreConsts";
import router from '../../router';

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
const {validateInfos, validate, validateField} = Form.useForm(user);

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
.bgc {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  /* background-color: rgb(0,106,255); */
  background: url(../../../public/img/login-bgi.webp) no-repeat;
  background-size: 100% 100%;
}
.login-container {
  display: flex;
  height: 400px;
  width: 700px;
  background-color: white;
  z-index: 1;
  border-radius: 30px;
  overflow: hidden;
}
.button-wrapper {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 40%;
  background-color: rgb(34,130,254);
  transition: all 1s ease-in-out;
}

/* 背景图片伪元素 */
.button-wrapper::after {
  content: '';
  background-image: url('@/assets/images/login-bgc.jpg');
  background-size: 900px 400px;
  background-position: top left;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: all 1s ease-in-out;
}

/* 表单模块 */
h1 {
  width: 100%;
  text-align: center;
  margin: 30px 0;
  font-weight: 700;
}
.login-wrapper {
  width: 65%;
  display: inline-block;
  transition: all 1s ease-in-out;
  background-color: #F3F3F3;
}

.ant-form {
  height: 240px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: space-around;
}


/* y验证码 */
.captcha-img {
  height: 40px;
  width: 100px;
  margin-left: 16px;
  vertical-align: top;
}
.login-err {
  color: #ed4014;
  margin: auto;
  margin-top: -17px;
}
</style>
