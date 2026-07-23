require("dotenv").config();
const { spawn } = require("child_process");
const fs = require("fs");

function normalizeHost(hostValue) {
    const value = String(hostValue || "").trim();
    if (!value) return "127.0.0.1";

    const lower = value.toLowerCase();
    if (lower === "localhost" || lower === "localhost.localdomain" || lower === "::1" || lower === "local") {
        return "127.0.0.1";
    }

    return value;
}

function getDefaultCredentials() {
    return {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || ""
    };
}

function isAuthFailure(stderr) {
    return /access denied|1045/i.test(stderr || "");
}

function runMysqldump({ host, port, username, password, database, outputPath }) {
    return new Promise((resolve, reject) => {
        const mysqldumpPath = process.env.MYSQLDUMP_PATH || "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";
        const safeHost = normalizeHost(host);
        const attempts = [];

        attempts.push({
            host: safeHost,
            port: port || 3306,
            username: username || "",
            password: password || "",
            database: database || ""
        });

        const needsFallback = !username || !password || ["localhost", "127.0.0.1", "::1"].includes(safeHost.toLowerCase());
        if (needsFallback) {
            const fallback = getDefaultCredentials();
            attempts.push({
                host: normalizeHost(fallback.host),
                port: fallback.port,
                username: fallback.username,
                password: fallback.password,
                database: database || fallback.database
            });
        }

        const tryAttempt = (index) => {
            const attempt = attempts[index];
            const args = [
                "-h",
                attempt.host,
                "-P",
                String(attempt.port || 3306),
                "-u",
                String(attempt.username || ""),
                `--password=${String(attempt.password || "")}`,
                String(attempt.database || "")
            ];

            const outputStream = fs.createWriteStream(outputPath);
            let stderr = "";

            const child = spawn(mysqldumpPath, args, { windowsHide: true });

            child.stdout.pipe(outputStream);
            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });

            child.on("error", (err) => {
                outputStream.destroy();
                reject(err);
            });

            child.on("close", (code) => {
                outputStream.end();
                if (code === 0) {
                    resolve({ outputPath, stderr, host: attempt.host, username: attempt.username });
                    return;
                }

                if (index < attempts.length - 1 && isAuthFailure(stderr)) {
                    tryAttempt(index + 1);
                    return;
                }

                reject(new Error(`mysqldump exited with code ${code}${stderr ? `\n${stderr}` : ""}`));
            });
        };

        tryAttempt(0);
    });
}

module.exports = {
    normalizeHost,
    runMysqldump
};
