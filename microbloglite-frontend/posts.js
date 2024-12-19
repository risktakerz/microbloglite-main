/* Posts Page JavaScript */

"use strict";

// Global variables
let currentPage = 1;
const postsPerPage = 10;
let isLoading = false;

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
                    Authorization: `Bearer ${loginData.token}`
                }
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
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create HTML element for a single post
function createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "card mb-3";
    
    const date = new Date(post.createdAt).toLocaleDateString();
    
    postDiv.innerHTML = `
        <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted">@${post.username}</h6>
            <p class="card-text">${post.text}</p>
            <div class="text-muted small">${date}</div>
        </div>
    `;
    
    return postDiv;
}


async function loadUserProfile() {
    try {
        const loginData = getLoginData();
        const response = await fetch(`${API_URL}/api/users/${loginData.username}`, {
            headers: {
                Authorization: `Bearer ${loginData.token}`
            }
        });

        if (!response.ok) throw new Error("Failed to load profile");

        const profile = await response.json();
        document.getElementById("profileUsername").textContent = `@${profile.username}`;
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
                    Authorization: `Bearer ${loginData.token}`
                },
                body: JSON.stringify({ text: postText })
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

  document.addEventListener("DOMContentLoaded", async () => {
    if (!isLoggedIn()) {
      alert("You must be logged in to view this page.");
      window.location.assign("/login.html");
      return;
    }
    await loadPosts();
    await loadUserProfile();
  });
  