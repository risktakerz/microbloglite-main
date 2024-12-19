document.getElementById("registrationForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const username = document.getElementById("username").value;
    const fullName = document.getElementById("fullName").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                fullName,
                password
            })
        });

        if (!response.ok) {
            throw new Error("Registration failed");
        }

        alert("Registration successful! Please login.");
        // window.location.assign("/index.html");
    } catch (error) {
        alert("Failed to register. Please try again.");
        console.error("Registration error:", error);
    }
}); 