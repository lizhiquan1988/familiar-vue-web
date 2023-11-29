<template>
    <h2 class="title-zc">アカウント登録</h2>
  <div class="register-container">
    <!-- 根标签 -->
    <el-form
      ref="form"
      :model="form"
      status-icon
      :rules="rules"
      label-width="auto"
      label-position="left"
      class="register-form"
    >

      <el-form-item label="アカウント名" prop="userId" >
        <el-input v-model="form.userId"></el-input>
      </el-form-item>

      <el-form-item label="パスワード" prop="passWord">
        <el-input
          type="password"
          v-model="form.passWord"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="パスワード(確認用)" prop="checkPass">
        <el-input
          type="password"
          v-model="form.checkPass"
          autocomplete="off"
        ></el-input>
      </el-form-item>

      <el-form-item label="ニックネーム" prop="userName">
        <el-input v-model="form.userName"></el-input>
      </el-form-item>

      <el-form-item label="メールアドレス" prop="mailAddress">
        <el-input v-model="form.mailAddress"></el-input>
      </el-form-item>
 
      <el-form-item label="学級" prop="childGrade">
        <el-input v-model.number="form.childGrade"></el-input>
      </el-form-item>
      
      <el-form-item label="続柄" prop="relationShipCode">
        <el-select
          v-model="form.relationShipCode"
          remote
          filterable
          @change="selectChange">
            <el-option
              v-for="(item, index) in relationShipList"
              v-show="item.isShow === false ? false : true"
              :key="item.value + `'${index}'`"
              :label="item.label"
              :value="item.value" />
          </el-select>
      </el-form-item>
     
      <el-form-item>
        <el-button type="primary" class="button" @click="submitForm('form')">登録</el-button>
        <el-button class="button" @click="resetForm('form')">クリア</el-button>
        <el-button class="button" @click="TransitToTop">戻る</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { ref } from 'vue';
import FamiliarService from "../services/FamiliarService";
export default {
  name: "MyRegistration",
  data() {
    var validatePass = (rule, value, callback) => {
      //rule:password的详细信息，value：password的值，callback:如果都不满足，则正常提交
      if (value === "") {
        callback(new Error("パスワードを入力してください。"));//输入为空的提示信息
      } else {
        if (this.form.checkPass !== "") {
          this.$refs.form.validateField("checkPass");//如果确认密码不为空，则去validatePass2这个函数
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("パスワードを入力してください。"));
      } else if (value !== this.form.passWord) {
        callback(new Error("パスワードが一致しません。"));
      } else {
        callback();
      }
    };
    return {
      relationShipList : ref([
        {
          isShow: true,
          value: 1,
          label: "父"
        },
        {
          isShow: true,
          value: 2,
          label: "母"
        },
          {
          isShow: true,
          value: 3,
          label: "子"
        },
      ]),
      form: {
        userId: "",
        userName: "",
        passWord: "",
        checkPass: "",
        mailAddress: "",
        childGrade: "",
        relationShipCode: "未選択",
        relationShipName: "",
      },
      rules: {
        userId: [{ required: true, message: "アカウントを入力してください。", trigger: "blur" }],//校验规则：必填、信息提示、失去焦点
        userName: [{ required: true, message: "ニックネームを入力してください。", trigger: "blur" }],
        passWord: [{ required: true, validator: validatePass, trigger: "blur" }],
        checkPass: [{ required: true, validator: validatePass2, trigger: "blur" }],
        mailAddress: [{type:'email', message: '正しいメールアドレス入力してください。', trigger:"change"}],
        relationShipCode: [{required: true, message: "続柄を入力してください。", trigger: "blur"}],
      },
    };
  },
  mounted() {
    
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          FamiliarService.userRegister(JSON.stringify(this.form))
          .then(res => {
            if (res.data === "OK") {
              this.resetForm("form")
              alert("登録成功。自動的にログイン画面に遷移する");
              this.$router.push({name:'login'})
            } else if (res.data === "EXIST") {
              alert("登録失敗。アカウント名は既に存在しています。");
            }
             else {
              alert("登録失敗しました。サーバー側問題があります。");
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
    selectChange() {
      console.log(this.form.relationShipCode)
      this.form.relationShipName = this.relationShipList[this.form.relationShipCode - 1].label
    }
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
.register-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* background-image: url("~@/assets/img/RegisterBackground.jpg"); */
  /* background-size: 100% 100%; */
  /* background-repeat: no-repeat; */
}
.register-form {
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
