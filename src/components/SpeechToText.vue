<template>
  <div class="recorder">
    <h2>🎤 AI 语音音响测试</h2>
    <div class="lang-switch">
      🌐 当前语言：<b>{{ currentLanguage }}</b>
      <button @click="toggleLanguage">切换语言</button>
      <p class="middle-space"></p>
      <button @click="toggleClearChatHistory">清理AI聊天记录</button>
      <p class="middle-space"></p>
      <button @click="sendAudioTest">发送测试语音</button>
    </div>

    <button @click="startRecording" :disabled="recording">开始录音</button>
    <button @click="stopRecording" :disabled="!recording">停止录音</button>
    <div v-if="status">状态: {{ status }}</div>
    <div v-if="aiContent">AI返回结果： {{ aiContent }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import FamiliarService from "../services/FamiliarService";

const ws = ref(null);
const mediaRecorder = ref(null);
const recording = ref(false);
const status = ref("");
const aiContent = ref("");
const heartbeatInterval = ref(null); // 用于存储心跳定时器

const WS_URL = "wss://mimamaori.tech/ws/audio";

const currentLang = ref(0); // 0=中文, 1=日文
const currentLanguage = ref("中文");

async function toggleLanguage() {
  try {
    const newLangCode = currentLang.value === 0 ? 1 : 0;
    const response = await FamiliarService.changeLanguage(newLangCode);
    const result = response.data;
    currentLanguage.value = newLangCode === 0 ? "中文" : "日文";
    currentLang.value = result.languageCode;
    console.log(result);
  } catch (err) {
    console.error("语言切换失败:", err);
    status.value = "❌ 语言切换失败";
  }
}

async function toggleClearChatHistory() {
    try {
    const response = await FamiliarService.clearHistory();
    const result = response.data;
    console.log("清理件数为："+result.clearNumber);
  } catch (err) {
    console.error("清理缓存失败:", err);
    status.value = "❌ 清理缓存失败";
  }
}

async function sendAudioTest() {
    try {
    const response = await FamiliarService.sendAudioTest();
    const result = response.data;
    console.log("语音链接："+result.playUrl);
  } catch (err) {
    console.error("清理缓存失败:", err);
    status.value = "❌ 清理缓存失败";
  }
}


async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream, { mimeType: "audio/webm" });
    ws.value = new WebSocket(WS_URL);

    ws.value.binaryType = "arraybuffer";

    ws.value.onopen = () => {
      status.value = "✅ WebSocket 已连接，开始录音...";
      recording.value = true;

            // 启动心跳，每30秒发送一次
      heartbeatInterval.value = setInterval(() => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
          ws.value.send(JSON.stringify({ cmd: "HEARTBEAT" }));
          console.log("💓 心跳已发送");
        }
      }, 30000); // 30秒一次，可根据需要调整

      mediaRecorder.value.start(200); // 每 200ms 发送一次
      mediaRecorder.value.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && ws.value.readyState === WebSocket.OPEN) {
          e.data.arrayBuffer().then((buffer) => {
            ws.value.send(buffer);
          });
        }
      };
    };

    ws.value.onmessage = async (evt) => {
      try {
        // 文本消息
        if (typeof evt.data === "string") {
          let strData = null;
          try {
            strData = JSON.parse(evt.data);
          } catch (err) {
            console.warn("⚠️ JSON 解析失败，原始数据:", evt.data);
          }

          if (strData && typeof strData === "object") {
            const cmd = strData.cmd || "";
            const content = strData.content || "";
            const msg = strData.msg || "";
            const size = strData.size || "";
            const audioUrl = strData.url || "";

            switch (cmd) {
              case "GPT_RESPONSE":
                aiContent.value = content;
                console.log("✅ 收到 GPT_RESPONSE，关闭连接...");
                if (ws.value && ws.value.readyState === WebSocket.OPEN) {
                  ws.value.close();
                }
                break;

              case "AUDIO_ACK":
                status.value = `🎧 收到音频确认：${msg}（大小：${size}）`;
                break;

              case "AUDIO_SAVE":
                status.value = `💾 音频已保存：${content}（大小：${size}）`;
                break;

              case "PLAY_AUDIO":
                if (audioUrl !== "") {
                  status.value = "🎧 正在播放 AI 语音...";
                  console.log("🎵 播放音频流：", audioUrl);

                  // 创建音频对象
                  const audio = new Audio(audioUrl);
                  audio.autoplay = true;
                  audio.onplay = () => {
                    console.log("▶️ 音频播放开始");
                  };
                  audio.onended = () => {
                    console.log("⏹️ 音频播放结束");
                    status.value = "✅ 播放完成";
                  };
                  audio.onerror = (err) => {
                    console.error("❌ 音频播放失败:", err);
                    status.value = "❌ 音频播放失败";
                  };
                }

                break;

              default:
                status.value = `ℹ️ 未知消息类型：${JSON.stringify(strData)}`;
                console.warn("⚠️ 未知命令:", strData);
                break;
            }
          } else {
            console.warn("⚠️ 收到无效数据:", evt.data);
          }

        } else if (evt.data instanceof Blob || evt.data instanceof ArrayBuffer) {
          // 二进制音频消息
          const arrayBuffer = await (evt.data.arrayBuffer ? evt.data.arrayBuffer() : evt.data);
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" }); // 或 audio/wav
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => {
            URL.revokeObjectURL(url);
          };
          audio.play().catch(err => console.error("播放失败", err));
        }
      } catch (err) {
        console.error("❌ 解析 WebSocket 消息出错:", err, evt.data);
        status.value = "❌ 消息解析失败";
      }
    };

    ws.value.onerror = (err) => {
      console.error("WebSocket 错误:", err);
      status.value = "❌ WebSocket 错误";
                  // 清理心跳定时器
      if (heartbeatInterval.value) {
        clearInterval(heartbeatInterval.value);
        heartbeatInterval.value = null;
      }
    };

    ws.value.onclose = () => {
      status.value = "🔌 WebSocket 已关闭";
      recording.value = false;
            // 清理心跳定时器
      if (heartbeatInterval.value) {
        clearInterval(heartbeatInterval.value);
        heartbeatInterval.value = null;
      }
    };
  } catch (err) {
    console.error("无法访问麦克风:", err);
    status.value = "🎙️ 无法访问麦克风";
  }
}

function stopRecording() {
  if (!mediaRecorder.value) return;

  mediaRecorder.value.stop();
  recording.value = false;
  status.value = "录音已停止，正在通知服务端保存...";

  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({ cmd: "FINISH" });
    ws.value.send(msg); // 发送结束信号
  }
}
</script>


<style scoped>
.recorder {
  text-align: center;
  padding: 2rem;
}
button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
}
.lang-switch {
  margin-bottom: 1rem;
}
.middle-space {
  height: 0.5rem
}
</style>
