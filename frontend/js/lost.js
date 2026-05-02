const BASE_URL = window.BASE_URL || "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    window.location.href = "login.html";
    return;
  }

  const submitBtn = document.getElementById("submitBtn");

  submitBtn.addEventListener("click", submitLost);

});

async function submitLost() {
  try {
    const itemName = document.getElementById("itemName").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();
    const location = document.getElementById("location").value.trim();
    const dateLost = document.getElementById("dateLost").value;
    const imageFile = document.getElementById("image").files[0];

    const user = JSON.parse(localStorage.getItem("user"));

    const title = category
      ? `${category}${itemName ? ' - ' + itemName : ''}`
      : itemName;

    if (!title || !location) {
      document.getElementById("lost_msg").innerText =
        "Please fill required fields";
      return;
    }

    // FormData use karo taaki image bhi send ho sake
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("user_id", user.id);
    formData.append("dateLost", dateLost || new Date().toISOString());
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await fetch(`${BASE_URL}/api/lost`, {
      method: "POST",
      body: formData   // Content-Type header mat lagao, browser khud set karega
    });

    const data = await res.json();

    if (res.ok) {
      alert("Lost Item Submitted Successfully ✅");
      window.location.href = "dashboard.html";
    } else {
      document.getElementById("lost_msg").innerText =
        data.message || "Submission failed";
    }

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("lost_msg").innerText =
      "Server not reachable";
  }
}