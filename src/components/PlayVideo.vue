<template>
  <div class="video-container">
    <h3>ピッピ ライブ</h3>
    <div class="status-bar">
      状态：<span :class="{ active: isConnected }">{{ statusText }}</span>
    </div>
    <div class="controls">
      <button class="btn" @click="sendLedOff">灯りOFF</button>
      <button class="btn" @click="sendLedOn">灯りON</button>
    </div>
    <div class="video-box">
      <img v-if="frameUrl" :src="frameUrl" alt="Live Stream" />
      <div v-else class="placeholder">ビデオ信号待ち...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isConnected = ref(false)
const statusText = ref('接続なし')
const frameUrl = ref('')

let socket = null
let currentObjectURL = null

const sendMessage = (msg) => {
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg)
      statusText.value = `送信: ${msg}`
    } else {
      console.warn('WebSocket not open, cannot send', msg)
      statusText.value = '未接続 - メッセージ未送信'
    }
  } catch (e) {
    console.error('Send message error', e)
  }
}

const sendLedOn = () => sendMessage('LED_ON')
const sendLedOff = () => sendMessage('LED_OFF')

// 动态构建 Netty WebSocket 的连接 URL
const getNettyWsUrl = () => {
  // 3. 拼接 Netty 端口 8889（注意路径需要与 ChannelInitializer 中的 WebSocketServerProtocolHandler 配置一致）
  return `https://mimamaori.tech//ws/video`;
}

const initWebSocket = () => {
  const wsUrl = getNettyWsUrl();
  console.log('Connecting to Netty WebSocket:', wsUrl);

  socket = new WebSocket(wsUrl);
  // 务必指定接收二进制的类型为 blob
  socket.binaryType = 'blob';

  socket.onopen = () => {
    isConnected.value = true;
    statusText.value = '已连接到服务器，正在注册...';
    
    // 向 Netty 发送身份注册标识（对应你 Handler 里的注册逻辑）
    socket.send('REGISTER_VIEWER');
    statusText.value = '監視中';
  };

  socket.onmessage = (event) => {
    // 接收 ESP32 广播的二进制 JPEG 帧
    if (event.data instanceof Blob) {
      // 及时释放上一帧的内存，防止浏览器内存溢出崩溃
      if (currentObjectURL) {
        URL.revokeObjectURL(currentObjectURL);
      }
      currentObjectURL = URL.createObjectURL(event.data);
      frameUrl.value = currentObjectURL;
    }
  };

  socket.onclose = () => {
    isConnected.value = false;
    statusText.value = '连接已断开';
  };

  socket.onerror = (err) => {
    console.error('Netty WebSocket 异常:', err);
  };
}

onMounted(() => {
  initWebSocket();
})

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
  }
})
</script>

<style scoped>
.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}
.status-bar {
  margin-bottom: 12px;
  font-size: 14px;
}
.status-bar .active {
  color: #42b983;
  font-weight: bold;
}
.video-box {
  width: 640px;
  height: 480px;
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
}
.video-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.placeholder {
  color: #888;
}
</style>