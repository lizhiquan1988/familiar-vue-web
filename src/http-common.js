import axios from "axios";

export default axios.create({
  baseURL: "https://www.mimamaori.tech/",
  // baseURL: "http://192.168.11.16:8080/",
  headers: {
    "Content-type": "application/json",
    // "Access-Control-Allow-Origin": "https://www.mimamaori.tech",
    // "Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    'Authorization': localStorage.getItem('token') ? 'Bearer ' + localStorage.getItem('token') : ''
  }
});