

"use strict";

const API_URL = "http://localhost:5005";


function saveLoginData(loginData) {
  localStorage.setItem("login-data", JSON.stringify(loginData));
}


function getLoginData() {
  return JSON.parse(localStorage.getItem("login-data"));
}


function removeLoginData() {
  localStorage.removeItem("login-data");
}


function isLoggedIn() {
  return getLoginData() !== null;
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.assign("/index.html");
  }
}
