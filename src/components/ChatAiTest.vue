<template>
  <div>
    <h2>智能音箱 Demo</h2>
    <input v-model="question" placeholder="请输入你的问题" />
    <button @click="askGpt">发送</button>

    <div v-if="answer">
      <h3>回答：</h3>
      <p>{{ answer }}</p>
    </div>
  </div>
</template>

<script>
import FamiliarService from "../services/FamiliarService";

export default {
  data() {
    return {
      question: "",
      answer: ""
    };
  },
  methods: {
    async askGpt() {
      try {
        const response = await FamiliarService.testChatApi({question: this.question});
        this.answer = response.data.answer;
      } catch (error) {
        console.error("请求失败:", error);
      }
    }
  }
};
</script>
