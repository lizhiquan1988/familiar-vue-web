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
}

export default new FamiliarService();