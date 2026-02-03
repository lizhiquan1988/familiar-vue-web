import http from "../http-common";

class FamiliarService {
    getAll() {
        return http.get("/location");
    }

    findByUserId(userId) {
        return http.get(`/location?userId=${userId}&lastFlag=1`);
    }

    // sendWebSocket(message) {
    //     return http.get(`/operation/10086/${message}`);
    // }
    sendWebSocket(message) {
        return http.get(`/webSocket/${message}`);
    }

    verifyToken(token) {
        return http.get(`/verify/${token}`);
    }

    userRegister(stringData) {
        return http.post('/api/register', stringData, {headers:{
            'Content-Type':'application/json;charset=utf-8'
          }})
    }

    userLogin(stringData) {
        return http.post('/api/login', stringData, {headers:{
            'Content-Type':'application/json;charset=utf-8'
          }})
    }

    getLatestTemp() {
        return http.get("/sensor/latest");
    }

    getDayTemp(stringData) {
        return http.get(`/sensor/day?date=${stringData}`);
    }

    resetTaken() {
        return http.get("/medicine/reset");
    }

    changeLanguage(intData) {
        return http.post(`/language/change?languageCode=${intData}`, {headers:{
            'Content-Type':'application/json;charset=utf-8'
          }})
    }

    clearHistory() {
        return http.get("/openai/clearHistory");
    }

    sendAudioTest() {
        return http.get("/openai/testAudio");
    }
    
    // speechToTextCommit(formData) {
    //     return http.post('/assemblyai/uploadFile', formData, {headers:{
    //         "Content-Type": "multipart/form-data"
    //       }})
    // }
    // speechToTextCheckResult(id) {
    //     return http.get(`/assemblyai/result/${id}`)
    // }
}

export default new FamiliarService();