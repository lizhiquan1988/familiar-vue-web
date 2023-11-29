<template>
    <h2 class="title-zc">ログイン画面</h2>
  <div class="login-container">
    <!-- 根标签 -->
    <el-form
      ref="loginForm"
      :model="loginForm"
      status-icon
      :rules="rules"
      label-width="auto"
      label-position="left"
      class="login-form"
    >

      <el-form-item label="アカウント名" prop="userId" >
        <el-input v-model="loginForm.userId"></el-input>
      </el-form-item>

      <el-form-item label="パスワード" prop="passWord">
        <el-input
          type="password"
          v-model="loginForm.passWord"
          autocomplete="off"
        ></el-input>
      </el-form-item>
    
      <el-form-item>
        <el-button type="primary" class="button" @click="submitForm('loginForm')">ログイン</el-button>
        <el-button class="button" @click="resetForm('loginForm')">クリア</el-button>
        <el-button class="button" @click="TransitToTop">トップに戻る</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import FamiliarService from "../services/FamiliarService";
import FamiliarGlobal from './FamiliarGlobal.vue';
export default {
  name: "LoginTo",
  data() {
    // Set initial data, this.createMap() configures event listeners that update data based on user interaction
    return {
      loginForm: {
        userId: "",
        passWord: "",
      },
      rules: {
        userId: [{ required: true, message: "アカウントを入力してください。", trigger: "blur" }],//校验规则：必填、信息提示、失去焦点
        passWord: [{ required: true, message: "パスワードを入力してください。", trigger: "blur" }],
      },
    };
  },
  mounted() {
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          FamiliarService.userLogin(JSON.stringify(this.loginForm))
          .then(res => {
            var result = res.data
            if (result === "NO_USER") {
              alert("先にアカウント登録してください。");
            } else if (result === "PASS_ERROR") {
              alert("アカウント名とパスワードが間違っています。");
            } else if (result.startsWith("UserId")) {
              var userIdArray = result.split(':')
              if(userIdArray.length > 2) {
                FamiliarGlobal.userId = userIdArray[1]
                FamiliarGlobal.LoginFlag = true
                FamiliarGlobal.token = userIdArray[2]
                localStorage.setItem("loginFlag", true)
                localStorage.setItem("userId", userIdArray[1])
                localStorage.setItem("token", userIdArray[2])
                console.log("token is :" + FamiliarGlobal.token)
                console.log("userId is :" + FamiliarGlobal.userId)
                this.resetForm("loginForm")
                alert("ログイン成功。自動的にトップ画面に遷移する");
                this.$router.push({name:'top'})
              } else {
                alert("ログイン失敗しました。サーバー側ユーザーID取得には問題があります。");
              }
            } else {
              alert("ログイン失敗しました。サーバー側未知問題があります。");
            }
          })
          .catch(function (error){
            console.log(error)
            alert("登録失敗しました。サーバー側問題があります。");
          })
        } else {
          console.log("登録失敗!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    TransitToTop() {
      this.$router.push({name:'top'})
    },
  }
}
</script>

<style scoped>
.button {
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 10px;
    margin: 5%;
    color: black;
    display: inline-block;
    border: 2px solid rgb(255,194,64);
    background: linear-gradient(to bottom, rgb(255,244,92), rgb(240,229,86)); 

}
.button:hover {
  color: blue;
}
.login-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* background-image: url("~@/assets/img/RegisterBackground.jpg"); */
  /* background-size: 100% 100%; */
  /* background-repeat: no-repeat; */
}
.login-form {
  width: 350px;
  margin: auto;
  background-color: rgba(90, 187, 211, 0.7);
  padding: 30px;
  border-radius: 20px;
}
.title-zc {
  text-align: center;
}

</style>