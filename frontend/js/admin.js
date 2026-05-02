const BASE_URL = window.BASE_URL || "http://localhost:5000";

// 🚨 Admin protection
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
  alert("Access denied! Only admin allowed.");
  window.location.href = "login.html";
}

// ✅ Load All Lost Items
async function loadAdminLost() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/lost`);
    const data = await res.json();

    const body = document.getElementById("adminLostBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="4" class="text-center">No Lost Items</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td>${item.name || "Unknown"}</td>
          <td>${item.title || "N/A"}</td>
          <td>${item.location || "N/A"}</td>
          <td>${item.description || "N/A"}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading lost items:", error);
  }
}

// ✅ Load All Found Items
async function loadAdminFound() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/found`);
    const data = await res.json();

    const body = document.getElementById("adminFoundBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="4" class="text-center">No Found Items</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td>${item.name || "Unknown"}</td>
          <td>${item.title || "N/A"}</td>
          <td>${item.location || "N/A"}</td>
          <td>${item.description || "N/A"}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading found items:", error);
  }
}


// 🚀 Load data when page loads
loadAdminLost();
loadAdminFound();
loadMatches();
loadUnmatched();

// ✅ Load Matches
async function loadMatches() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/matches`);
    const data = await res.json();
    const body = document.getElementById("matchBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="9" class="text-center">No matches found</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td class="text-center"><i class="fa-solid fa-image fa-2x text-muted"></i></td>
          <td class="text-center"><i class="fa-solid fa-image fa-2x text-muted"></i></td>
          <td><strong>Lost:</strong> ${item.lost_title}<br><strong>Found:</strong> ${item.found_title}</td>
          <td>${item.lost_location} <br> ${item.found_location}</td>
          <td><span class="badge bg-success fs-6">${item.match_score}</span></td>
          <td>${item.lost_student} <br> ${item.found_student}</td>
          <td>${item.lost_email} <br> ${item.found_email}</td>
          <td>${item.date_found ? new Date(item.date_found).toLocaleDateString() : "N/A"}</td>
          <td>
            <button class="btn btn-sm btn-success mb-1 w-100" onclick="approveMatch(${item.lost_id}, ${item.found_id})">Approve</button>
            <button class="btn btn-sm btn-danger w-100" onclick="rejectMatch(this)">Reject</button>
          </td>
        </tr>
      `;
    });
  } catch(error) {
    console.error("Match load error", error);
  }
}

// ✅ Load Unmatched
async function loadUnmatched() {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/unmatched`);
    const data = await res.json();
    const body = document.getElementById("unmatchedBody");
    body.innerHTML = "";

    if (!data || data.length === 0) {
      body.innerHTML = `<tr><td colspan="6" class="text-center">No unmatched items</td></tr>`;
      return;
    }

    data.forEach(item => {
      body.innerHTML += `
        <tr>
          <td><span class="badge ${item.type === 'Lost' ? 'bg-danger' : 'bg-primary'}">${item.type}</span></td>
          <td class="text-center"><i class="fa-solid fa-image fa-2x text-muted"></i></td>
          <td>${item.title || "N/A"}</td>
          <td>${item.location || "N/A"}</td>
          <td>${item.date ? new Date(item.date).toLocaleDateString() : "N/A"}</td>
          <td>${item.reported_by || "Unknown"}</td>
        </tr>
      `;
    });
  } catch(error) {
    console.error("Unmatched load error", error);
  }
}

// ✅ Approve Match
async function approveMatch(lost_id, found_id) {
  if (!confirm("Are you sure you want to approve this match? This will mark both items as resolved.")) return;

  try {
    const res = await fetch(`${BASE_URL}/api/admin/match/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lost_id, found_id })
    });
    const data = await res.json();
    if(res.ok) {
      alert("Match approved!");
      loadMatches();
      loadUnmatched();
      loadAdminLost();
      loadAdminFound();
    } else {
      alert(data.message || "Error approving match");
    }
  } catch(error) {
    console.error(error);
  }
}

// ✅ Reject Match
function rejectMatch(btn) {
  if (!confirm("Are you sure you want to reject this match?")) return;
  btn.closest('tr').remove();
}