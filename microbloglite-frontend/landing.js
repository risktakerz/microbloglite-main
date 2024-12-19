/* Landing Page JavaScript */

"use strict";

const loginForm = document.querySelector("#loginForm");

loginForm.onsubmit = function (event) {

  event.preventDefault();


  const loginData = {
    username: loginForm.username.value,
    password: loginForm.password.value,
  };

  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  login(loginData)
    .then((response) => {
      console.log("Login successful!", response);

      window.location.href = "posts.html";
    })
    .catch((error) => {
      console.error("Login failed:", error);
      alert("Invalid username or password. Please try again.");
    })
    .finally(() => {
      submitButton.disabled = false;
    });
};

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const loginData = await response.json();
        saveLoginData(loginData);
        window.location.assign("/posts.html");
    } catch (error) {
        alert("Failed to login. Please check your credentials and try again.");
        console.error("Login error:", error);
    }
});

function isLoggedIn() {
  const loginData = loginData();
  return loginData && loginData.token; // Ensure login data and token exist
}
