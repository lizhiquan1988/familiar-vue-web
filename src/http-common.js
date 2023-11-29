import axios from "axios";

export default axios.create({
  // baseURL: "https://www.mimamaori.tech/",
  baseURL: "https://192.168.11.16/",
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "https://www.mimamaori.tech",
    "Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    'Authorization': 'Bearer ' + localStorage.getItem('token') === null? "": localStorage.getItem('token')
  }
});