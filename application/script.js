// Change this to your deployed worker URL once Terraform provisions it (or keep relative for custom routes)
const API_URL = "/api/tasks";

document.addEventListener("DOMContentLoaded", () => {
    fetchTasks();

    document.getElementById("taskForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value;
        const priority = document.getElementById("taskPriority").value;

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, priority, status: "Pending" })
            });

            if (res.ok) {
                document.getElementById("taskTitle").value = "";
                fetchTasks();
            } else {
                alert("Failed to create task");
            }
        } catch (err) {
            console.error("Error creating task:", err);
        }
    });
});

async function fetchTasks() {
    try {
        const res = await fetch(API_URL);
        const tasks = await res.json();
        const tbody = document.getElementById("taskTableBody");
        tbody.innerHTML = "";

        if (tasks.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #6b7280;">No tasks found. Create one above!</td></tr>`;
            return;
        }

        tasks.forEach(task => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><code>${task.id}</code></td>
                <td>${task.title}</td>
                <td>${task.priority}</td>
                <td><span class="badge ${task.status.toLowerCase()}">${task.status}</span></td>
                <td>${task.createdDate || "N/A"}</td>
                <td>
                    <button class="btn-action btn-toggle" onclick="toggleStatus('${task.id}', '${task.status}')">
                        ${task.status === "Pending" ? "Complete" : "Reopen"}
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error fetching tasks:", err);
    }
}

async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        fetchTasks();
    } catch (err) {
        console.error("Error updating task status:", err);
    }
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        fetchTasks();
    } catch (err) {
        console.error("Error deleting task:", err);
    }
}