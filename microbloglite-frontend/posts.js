/* Posts Page JavaScript */

"use strict";

// Global variables
let currentPage = 1;
const postsPerPage = 10;
let isLoading = false;
const loginData = JSON.parse(localStorage.getItem("login-data")) || {};
const TOKEN = loginData.token;

// DOM Elements
const postsContainer = document.getElementById("postsContainer");
const loadMoreButton = document.getElementById("loadMoreButton");
const createPostForm = document.getElementById("createPostForm");
const logoutButton = document.getElementById("logoutButton");

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  await loadPosts();
  await loadUserProfile();
  setupEventListeners();
});

// Load posts from the API
async function loadPosts() {
  if (isLoading) return;
  isLoading = true;

  try {
    const loginData = getLoginData();
    const response = await fetch(
      `${API_URL}/api/posts?limit=${postsPerPage}&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (!response.ok) throw new Error("Failed to load posts");

    const data = await response.json();
    displayPosts(data);
    currentPage++;

    // Hide load more button if no more posts
    if (data.length < postsPerPage) {
      loadMoreButton.style.display = "none";
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    alert("Failed to load posts. Please try again later.");
  } finally {
    isLoading = false;
  }
}

// Display posts in the container
function displayPosts(posts) {
  posts.forEach((post) => {
    const postElement = createPostElement(post);
    postsContainer.appendChild(postElement);
  });
}

// Create HTML element for a single post
function createPostElement(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "card mb-3";

  const date = new Date(post.createdAt).toLocaleDateString();

  // Get current user's username to check if they own the post
  const loginData = getLoginData();
  const isOwnPost = post.username === loginData.username;

  // Add delete button HTML only if it's the user's own post
  const deleteButton = isOwnPost
    ? `
        <button class="btn btn-link text-danger delete-post-btn" data-post-id="${post._id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1z"/>
            </svg>
        </button>
    `
    : "";

  postDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex flex-column align-items-center me-3">
                    <button class="btn btn-link like-btn ${
                      post.likes && post.likes.includes(loginData.username)
                        ? "active"
                        : ""
                    }" data-post-id="${post._id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                            <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
                        </svg>
                        <span class="likes-count">${
                          post.likes ? post.likes.length : 0
                        }</span>
                    </button>
                </div>
                <div class="flex-grow-1">
                    <h6 class="card-subtitle mb-2 text-muted">@${
                      post.username
                    }</h6>
                    <p class="card-text">${post.text}</p>
                    <div class="text-muted small">${date}</div>
                </div>
                ${deleteButton}
            </div>
        </div>
    `;

  // Add event listeners
  if (isOwnPost) {
    const deleteBtn = postDiv.querySelector(".delete-post-btn");
    deleteBtn.addEventListener("click", () => deletePost(post._id, postDiv));
  }

  // Add like event listener
  const likeBtn = postDiv.querySelector(".like-btn");
  likeBtn.addEventListener("click", () => handleLike(post._id, likeBtn));

  return postDiv;
}

async function deletePost(postId, postElement) {
  if (!confirm("Are you sure you want to delete this post?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    postElement.remove();
  } catch (error) {
    console.error("Error deleting post:", error);
    alert("Failed to delete post. Please try again.");
  }
}

async function loadUserProfile() {
  try {
    const loginData = getLoginData();
    const response = await fetch(`${API_URL}/api/users/${loginData.username}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load profile");

    const profile = await response.json();
    document.getElementById(
      "profileUsername"
    ).textContent = `@${profile.username}`;
    document.getElementById("profileFullName").textContent = profile.fullName;
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

function setupEventListeners() {
  createPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const postText = document.getElementById("postText").value;
    const loginData = getLoginData();

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ text: postText }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      createPostForm.reset();
      postsContainer.innerHTML = "";
      currentPage = 1;
      await loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    }
  });

  loadMoreButton.addEventListener("click", loadPosts);

  logoutButton.addEventListener("click", () => {
    removeLoginData();
    window.location.assign("/index.html");
  });
}

// Handle like functionality
async function handleLike(postId, button) {
  try {
    const isLiked = button.classList.contains("active");
    const likesCount = button.querySelector(".likes-count");
    const currentLikes = parseInt(likesCount.textContent);

    if (isLiked) {
      // Get the like ID first
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get post details");
      }

      const post = await response.json();
      const loginData = getLoginData();
      const like = post.likes.find(
        (like) => like.username === loginData.username
      );

      if (!like) {
        throw new Error("Like not found");
      }

      // Unlike using the like ID
      const unlikeResponse = await fetch(`${API_URL}/api/likes/${like._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      if (unlikeResponse.status === 204) {
        likesCount.textContent = currentLikes - 1;
        button.classList.remove("active");
      } else {
        throw new Error("Failed to unlike post");
      }
    } else {
      // Like
      const response = await fetch(`${API_URL}/api/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ postId }),
      });

      if (response.status === 201) {
        likesCount.textContent = currentLikes + 1;
        button.classList.add("active");
      } else if (response.status === 400) {
        // Check if it's a duplicate key error
        const errorData = await response.json();
        if (errorData.message.includes("duplicate key error")) {
          // If already liked, try to unlike
          const getPostResponse = await fetch(
            `${API_URL}/api/posts/${postId}`,
            {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
              },
            }
          );

          if (!getPostResponse.ok) {
            throw new Error("Failed to get post details");
          }

          const post = await getPostResponse.json();
          const like = post.likes.find(
            (like) => like.username === loginData.username
          );

          if (like) {
            const unlikeResponse = await fetch(
              `${API_URL}/api/likes/${like._id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${TOKEN}`,
                },
              }
            );

            if (unlikeResponse.status === 204) {
              likesCount.textContent = currentLikes - 1;
              button.classList.remove("active");
            }
          }
        } else {
          throw new Error("Failed to like post");
        }
      } else {
        throw new Error("Failed to like post");
      }
    }
  } catch (error) {
    console.error("Error updating like:", error);
    alert("Failed to update like. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    alert("You must be logged in to view this page.");
    window.location.assign("/login.html");
    return;
  }
  await loadPosts();
  await loadUserProfile();
});
