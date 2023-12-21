<template>
  <div class="big">
    <div>
      <div class="my-logo">
        <img src="@/../public/img/logo.png" alt="">
      </div>
      <div class="my-font">name123</div>
    </div>
  </div>
</template>
<style scoped>
.big {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  /* border-bottom: 1px solid #000; */
}
.big div:first-child {
  display: flex;
  flex-direction: column;
  height: 80px;
  width: 80px;
  /* background-color: pink; */
  .my-logo {
    flex: 0.5;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      height: 60px;
      /* height: 100%; */
    }
  }
  .my-font {
    flex: 0.3;
    width: 100%;
    justify-content: center;
    display: flex;
    font-size: 30px;
    font-family:'FZShuTi';
    font-weight: 800;
    margin-top: 9px;
  }
}
</style>