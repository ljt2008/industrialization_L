<template>
    <div class="bgc">
      <div class="left-bgc">
        <img src="../../../public/img/login-bgi.jpg" alt="">
      </div>
      <div class="right-form">
        <toplogo />
        <div class="login-wrapper">
          <myform />
        </div>
        <bottomlogo />
    </div>
  </div>
</template>

<script setup lang="ts">
import bottomlogo from '@/views/login/components/BottomLogo.vue'
import toplogo from '@/views/login/components/TopLogo.vue'
import myform from '@/views/login/components/Form.vue'
import { reactive, ref } from 'vue'

</script>

<style scoped>
.bgc {
  display: flex;
  position: relative;
  overflow: hidden;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  width: 100%;
  /* background-color: rgb(0,106,255); */
  /* background: url(../../../public/img/login-bgi.webp) no-repeat; */
  /* background-size: 100% 100%; */
}
.right-form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  width: 700px;
  background-color: #fff;
  z-index: 1;
  overflow: hidden;
  flex: 27;
  border-left: 1.5px solid #BFC2C6;
}


/* 表单模块 */
h1 {
  width: 100%;
  text-align: center;
  margin: 30px 0;
  font-weight: 700;
}
.login-wrapper {
  width: 80%;
  height: 100%;
  background-color: #fff;
  margin: 0 auto;
  /* display: flex;
  justify-content: space-between;
  flex-direction: column; */

}



/* 左侧图片 */
.left-bgc {
  flex: 73;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
}
.left-bgc img:first-child {
  /* height: 100%; */
  width: 100%;
  height: auto;
  vertical-align: top;
  margin: 0;
}
/* ant-design-vue 二次加工 */

</style>
