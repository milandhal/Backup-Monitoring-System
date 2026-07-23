/**
 * Database Backup Monitoring System (BMS) - Core Application Script
 * Provides state management, simulations, UI triggers, and storage sync.
 */

// Initial mock databases to populate local storage if not existing
const DEFAULT_INSTANCES = [
    {
        id: "icard_oracle",
        name: "ICARD (CRIS Division)",
        ip: "10.180.18.2",
        type: "Oracle",
        port: "1521",
        status: "Connected",
        lastBackup: "25-05-2026 10:30 AM",
        lastDowntime: "25-05-2026 08:15 AM",
        backupLocation: "D:/DatabaseBackup/ICARD/",
        username: "admin",
        remark: "Weekly schema verification done. Health is good."
    },
    {
        id: "irctc_prod",
        name: "IRCTC Ticketing Prod",
        ip: "10.180.20.4",
        type: "MySQL",
        port: "3306",
        status: "Connected",
        lastBackup: "29-05-2026 04:00 AM",
        lastDowntime: "22-04-2026 11:30 PM",
        backupLocation: "/mnt/nfs/ticketing_prod/",
        username: "irctc_backup",
        remark: "Completed backup of 50 partition tables successfully."
    },
    {
        id: "fois_backup",
        name: "FOIS Freight Server",
        ip: "10.182.5.12",
        type: "Oracle",
        port: "1522",
        status: "Disconnected",
        lastBackup: "24-05-2026 11:45 PM",
        lastDowntime: "29-05-2026 09:00 PM",
        backupLocation: "E:/Backups/FOIS/",
        username: "fois_sys",
        remark: "Connection timeout on network switch RailTel Route 4."
    },
    {
        id: "coa_db",
        name: "COA Control Office",
        ip: "10.180.32.9",
        type: "MySQL",
        port: "3308",
        status: "Warning",
        lastBackup: "28-05-2026 02:00 AM",
        lastDowntime: "28-05-2026 04:30 AM",
        backupLocation: "/var/backups/coa/",
        username: "coa_admin",
        remark: "Warning: High transaction logs volume. Disk space 85% full."
    },
    {
        id: "uts_reports",
        name: "UTS Unreserved Tickets System",
        ip: "10.180.15.55",
        type: "Oracle",
        port: "1521",
        status: "Connected",
        lastBackup: "30-05-2026 01:15 AM",
        lastDowntime: "None",
        backupLocation: "F:/UTS_Backup_Share/",
        username: "uts_sec",
        remark: "Full database backup completed with checksum matches."
    }
];

const DEFAULT_HISTORY = [
    { id: "BKP-20260530-001", name: "UTS Unreserved Tickets System", type: "Oracle", date: "30-05-2026", time: "01:15 AM", duration: "12m 40s", size: "45.8 GB", status: "Success", remark: "Daily incremental backup successful" },
    { id: "BKP-20260529-012", name: "IRCTC Ticketing Prod", type: "MySQL", date: "29-05-2026", time: "04:00 AM", duration: "18m 15s", size: "82.4 GB", status: "Success", remark: "High-volume compressed tables completed" },
    { id: "BKP-20260529-009", name: "FOIS Freight Server", type: "Oracle", date: "29-05-2026", time: "09:00 PM", duration: "--", size: "0 KB", status: "Failed", remark: "Network timeout: RailTel Route 4 offline" },
    { id: "BKP-20260528-005", name: "COA Control Office", type: "MySQL", date: "28-05-2026", time: "02:00 AM", duration: "05m 12s", size: "12.8 GB", status: "Success", remark: "Retention cleaner executed concurrently" },
    { id: "BKP-20260525-004", name: "ICARD (CRIS Division)", type: "Oracle", date: "25-05-2026", time: "10:30 AM", duration: "25m 04s", size: "108.5 GB", status: "Success", remark: "Full cold schema dump accomplished" },
    { id: "BKP-20260524-002", name: "FOIS Freight Server", type: "Oracle", date: "24-05-2026", time: "11:45 PM", duration: "42m 10s", size: "320.1 GB", status: "Success", remark: "Monthly master backup completed" }
];

const DEFAULT_NOTIFICATIONS = [
    { type: "danger", title: "FOIS Freight Server Status Disconnected", time: "10 mins ago", msg: "Database Instance FOIS (10.182.5.12) is unreachable on Port 1522." },
    { type: "success", title: "Backup Succeeded Successfully", time: "4 hours ago", msg: "Daily database backup for UTS Reports (Oracle) finished successfully. Size: 45.8 GB." },
    { type: "warning", title: "COA Disk Alert", time: "8 hours ago", msg: "Storage server hosting COA Control Office is exceeding 85% capacity threshold." },
    { type: "success", title: "Ticketing Backup Accomplished", time: "1 day ago", msg: "Weekly full compression backup for IRCTC Ticketing Prod completed." },
    { type: "info", title: "Backup Schedule Configured", time: "2 days ago", msg: "Backup schedule for ICARD modified by user admin." }
];

// Initialize LocalStorage Data
function initBMSData() {
    if (!localStorage.getItem('bms_instances')) {
        localStorage.setItem('bms_instances', JSON.stringify(DEFAULT_INSTANCES));
    }
    if (!localStorage.getItem('bms_history')) {
        localStorage.setItem('bms_history', JSON.stringify(DEFAULT_HISTORY));
    }
    if (!localStorage.getItem('bms_notifications')) {
        localStorage.setItem('bms_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
}

function readStoredJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed == null ? fallback : parsed;
    } catch {
        localStorage.removeItem(key);
        return fallback;
    }
}

// Fetch lists
function getInstances() {
    const data = readStoredJSON('bms_instances', DEFAULT_INSTANCES);
    return Array.isArray(data) ? data : DEFAULT_INSTANCES;
}

function saveInstances(instances) {
    localStorage.setItem('bms_instances', JSON.stringify(instances));
}

function getHistory() {
    const data = readStoredJSON('bms_history', DEFAULT_HISTORY);
    return Array.isArray(data) ? data : DEFAULT_HISTORY;
}

function getNotifications() {
    const data = readStoredJSON('bms_notifications', DEFAULT_NOTIFICATIONS);
    return Array.isArray(data) ? data : DEFAULT_NOTIFICATIONS;
}

// Global UI Handlers
document.addEventListener("DOMContentLoaded", () => {
    // Initialize standard storage data
    initBMSData();

    // Dark Mode initialization & toggler
    const themeToggle = document.getElementById("theme-toggle-btn");
    const savedTheme = localStorage.getItem("bms_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("bms_theme", newTheme);
            updateThemeIcon(newTheme);
            showToast("Theme Preferences Updated", `Switched to ${newTheme === "dark" ? "Dark Control Room" : "Light Enterprise"} mode.`, "info");
        });
    }

    // Sidebar collapse toggler
    // const sidebarToggle = document.getElementById("sidebar-toggle");
    // const sidebar = document.querySelector(".sidebar");
    // const mainWrapper = document.querySelector(".main-wrapper");
    // const savedSidebarState = localStorage.getItem("bms_sidebar_collapsed") === "true";

    // if (sidebar && mainWrapper) {
    //     if (savedSidebarState) {
    //         sidebar.classList.add("collapsed");
    //         mainWrapper.classList.add("collapsed");
    //     }

    //     // if (sidebarToggle) {
    //     //     sidebarToggle.addEventListener("click", () => {
    //     //         sidebar.classList.toggle("collapsed");
    //     //         mainWrapper.classList.toggle("collapsed");
    //     //         localStorage.setItem("bms_sidebar_collapsed", sidebar.classList.contains("collapsed"));
    //     //     });
    //     // }
    // }

const sidebar = document.querySelector(".sidebar");
const mainWrapper = document.querySelector(".main-wrapper");

if (sidebar && mainWrapper) {
    sidebar.classList.remove("collapsed");
    mainWrapper.classList.remove("collapsed");
}

    // Initialize notification counters
    updateNotificationBadges();
});

// Update Theme Toggling Icon indicator
function updateThemeIcon(theme) {
    const icon = document.querySelector("#theme-toggle-btn i");
    if (icon) {
        if (theme === "dark") {
            icon.className = "fas fa-sun text-warning";
        } else {
            icon.className = "fas fa-moon text-light";
        }
    }
}

// Update Notification counter dynamically
function updateNotificationBadges() {
    const notifications = getNotifications();
    const badges = document.querySelectorAll(".notification-count-badge");
    badges.forEach(b => {
        b.textContent = notifications.length;
        b.style.display = notifications.length > 0 ? "block" : "none";
    });
}

// Custom High-Fidelity Toast alerts generator
function showToast(title, message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `bms-toast toast-${type}`;
    
    let iconClass = "fa-check-circle text-success";
    if (type === "danger") iconClass = "fa-exclamation-triangle text-danger";
    if (type === "warning") iconClass = "fa-exclamation-circle text-warning";
    if (type === "info") iconClass = "fa-info-circle text-primary";

    toast.innerHTML = `
        <i class="fas ${iconClass} fa-lg"></i>
        <div class="flex-grow-1">
            <h6 class="mb-0 fw-bold" style="font-size: 0.9rem;">${title}</h6>
            <small class="text-muted" style="font-size: 0.78rem;">${message}</small>
        </div>
        <button type="button" class="btn-close ms-auto" style="font-size: 0.7rem;" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);
    
    // Automatically remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = "slideInRight 0.3s reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

async function getInstancesFromServer() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/instances");
        const raw = await response.json();
        return raw.map(ins => ({
            id: ins.id.toString(),
            name: ins.name,
            ip: ins.ip,
            type: ins.db_type,
            port: ins.port,
            status: ins.status,
            username: ins.username,
            dbName: ins.db_name,
            backupLocation: ins.backup_location || ins.last_backup_location || "—",
            remark: ins.remarks || ins.last_backup_remarks || "No backup recorded",
            lastBackup: ins.lastBackup ? new Date(ins.lastBackup).toLocaleString() : "No backup recorded",
            lastBackupDuration: ins.last_backup_duration || "No backup recorded",
            lastBackupSize: ins.last_backup_size || "No backup recorded",
            lastBackupRemark: ins.last_backup_remarks || "No backup recorded",
            lastBackupStatus: ins.last_backup_status || "No backup recorded"
        }));
    } catch (err) {
        console.error("Failed to fetch instances from backend:", err);
        return [];
    }
}
