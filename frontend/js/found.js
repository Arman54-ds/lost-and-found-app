const BASE_URL = window.BASE_URL || "http://localhost:5000";

async function submitFound() {

  const itemName = document.getElementById("itemName").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();
  const location = document.getElementById("location").value.trim();
  const dateFound = document.getElementById("dateFound").value;
  const imageFile = document.getElementById("image").files[0];

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    window.location.href = "login.html";
    return;
  }

  const title = category
    ? `${category}${itemName ? ' - ' + itemName : ''}`
    : itemName;

  if (!title || !location) {
    document.getElementById("found_msg").innerText = "Please fill required fields";
    return;
  }

  // FormData use karo taaki image bhi send ho sake
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("location", location);
  formData.append("user_id", user.id);
  formData.append("dateFound", dateFound || new Date().toISOString());
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await fetch(`${BASE_URL}/api/found`, {
    method: "POST",
    body: formData   // Content-Type header mat lagao, browser khud set karega
  });

  const data = await res.json();

  if (res.ok) {
    alert("Found Item Submitted Successfully");
    window.location.href = "history.html";
  } else {
    document.getElementById("found_msg").innerText = data.message;
  }
}