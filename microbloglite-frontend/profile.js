document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    alert("You must be logged in to view this page.");
    window.location.assign("/login.html");
    return;
  }
  await loadPosts();
  await loadUserProfile();
});

logoutButton.addEventListener("click", () => {
  removeLoginData();
  window.location.assign("/index.html");
});
