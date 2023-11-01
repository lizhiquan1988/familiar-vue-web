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
}

export default new FamiliarService();