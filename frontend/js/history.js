const BASE_URL = window.BASE_URL || "http://localhost:5000";
const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {
  window.location.href = "login.html";
}

// Helper: image cell banana
function imageCell(imageName) {
  if (imageName) {
    return `<img src="${BASE_URL}/uploads/${imageName}" alt="Item Image"
              style="width:60px; height:60px; object-fit:cover; border-radius:6px; cursor:pointer;"
              onclick="window.open('${BASE_URL}/uploads/${imageName}', '_blank')">`;
  }
  return `<span class="badge bg-secondary">No Image</span>`;
}

// Load Lost Items
async function loadLost() {
  try {
    const res = await fetch(`${BASE_URL}/api/lost/user/${user.id}`);
    const data = await res.json();

    const body = document.getElementById("lostBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="text-center">No Lost Items</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td>${imageCell(item.image)}</td>
          <td>${item.title || "N/A"}</td>
          <td>${item.location || "N/A"}</td>
          <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}</td>
          <td><span class="badge bg-warning text-dark">${item.status || "Pending"}</span></td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading lost items:", error);
    const body = document.getElementById("lostBody");
    body.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading items</td></tr>`;
  }
}

// Load Found Items
async function loadFound() {
  try {
    const res = await fetch(`${BASE_URL}/api/found/user/${user.id}`);
    const data = await res.json();

    const body = document.getElementById("foundBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="text-center">No Found Items</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td>${imageCell(item.image)}</td>
          <td>${item.title || "N/A"}</td>
          <td>${item.location || "N/A"}</td>
          <td>${item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}</td>
          <td><span class="badge bg-info">${item.status || "Pending"}</span></td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading found items:", error);
    const body = document.getElementById("foundBody");
    body.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading items</td></tr>`;
  }
}

loadLost();
loadFound();