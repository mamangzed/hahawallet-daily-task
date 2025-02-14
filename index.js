const axios = require('axios');
const { Table } = require('console-table-printer');
const { on } = require('events');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk')
const {
    Twisters,
    LineBuffer,
    terminalSupportsUnicode,
    dots,
    dashes
} = require('twisters'); const twisters = new Twisters({
    spinner: terminalSupportsUnicode() ? dots : dashes,
    flushInactive: true,
    pinActive: false,
    messageDefaults: {
        active: true,
        removed: false,
        render: (message, frame) => {
            const { active, text } = message;
            return active && frame ? `${frame} ${text}` : text;
        }
    },
    buffer: new LineBuffer({
        EOL: '\n',
        disable: !!process.env.CI,
        discardStdin: true,
        handleSigint: true,
        stream: process.stderr,
        truncate: true,
        wordWrap: false
    })
});

function displayAppTitle() {
    console.log('\n' + 
        chalk.cyan(figlet.textSync(' HahaWallet ', { horizontalLayout: 'full' })) +
        '\n' + chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━') +
        '\n' + chalk.gray('By Mamangzed') +
        '\n' + chalk.dim('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
}

async function login(email, password) {
    const data = JSON.stringify({ email, password });

    try {
        const response = await axios.post("https://prod.haha.me/users/login", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data)
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: false,
            data: error.response?.data || error.message
        };
    }
}



async function getKarmaPoint(bearer) {
    const data = `{"operationName":null,"variables":{},"query":"{ getKarmaPoints }"}`; 

    const headers = {
        "Connection": "keep-alive",
        "User-Agent": "okhttp/4.9.2",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "x-request-source-extra": "android",
        "authorization": `${bearer}` 
    };

    try {
        const response = await axios.post("https://prod.haha.me/wallet-api/graphql", data, { headers });
        return { error: false, data: response.data };
    } catch (error) {
        return { error: true, data: error.response?.data || error.message };
    }
}


async function getReferalInfo(bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {},
        "query": "{ getReferralInfo { user_id referral_code referral_link count karma_available reward reward_available partner_code referrer_code total_referral_karma __typename } }"
    });

    try {
        const response = await axios.post("https://prod.haha.me/users/", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "authorization": bearer
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: false,
            data: error.response?.data || error.message
        };
    }
}

async function onBoarding(bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {},
        "query": "{ getOnboarding { show expired user_id completed_all completed_at karma_available karma_paid karma_multiplier max_transaction_perday total_streaks_karma redeemed_karma tasks { task_id type name description content link deeplink completed completed_at karma_available karma_paid today_transactions hide_after_completion __typename } __typename } }"
    });

    try {
        const response = await axios.post("https://prod.haha.me/wallet-api/graphql", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "authorization": bearer
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: false,
            data: error.response?.data || error.message
        };
    }
}

async function checkIn(bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {},
        "query": "{ getOnboarding { show expired user_id completed_all completed_at karma_available karma_paid karma_multiplier max_transaction_perday total_streaks_karma redeemed_karma tasks { task_id type name description content link deeplink completed completed_at karma_available karma_paid today_transactions hide_after_completion __typename } __typename } }"
    });

    try {
        const response = await axios.post("https://prod.haha.me/wallet-api/graphql", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "authorization": bearer
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: false,
            data: error.response?.data || error.message
        };
    }
}

async function getRank(bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {},
        "query": "{ getRankInfo { rank karma karmaToNextRank rankName rankImage __typename } }"
    });

    try {
        const response = await axios.post("https://prod.haha.me/wallet-api/graphql", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "authorization": bearer
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: false,
            data: error.response?.data || error.message
        };
    }
}

function cilukBa(email) {
    if (!email.includes("@")) return email;

    let [local, domain] = email.split("@");

    if (local.length <= 6) {
        return local.charAt(0) + "***@" + domain;
    }

    let firstThree = local.substring(0, 3);
    let lastThree = local.substring(local.length - 3);
    let censored = firstThree + "***" + lastThree + "@" + domain;

    return censored;
}

async function readAccounts(filePath = 'accounts.json') {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Gagal membaca file JSON:", error);
        return null;
    }
}


function updateTableData(accounts) {
    return new Promise(async (resolve) => {
        const tableData = await Promise.all(accounts.map(async (account, index) => {
            const log = await login(account.email, account.password);
            const karma = await getKarmaPoint(log.data.id_token);
            const referal = await getReferalInfo(log.data.id_token);
            const onBoard = await onBoarding(log.data.id_token);
            const check = await checkIn(log.data.id_token);
            const getRankInfo = await getRank(log.data.id_token);
            const taskNotComplite = [];
            onBoard.data.data.getOnboarding.tasks.forEach(task => {
                if(task.completed == false){
                    taskNotComplite.push(task.name);
                }
            });
            const taskList = taskNotComplite.length > 0 ? "🔹 " + taskNotComplite.join("\n🔹 ") : "✅ All tasks completed";
            return {
                No: index + 1,
                Email: cilukBa(account?.email ?? "N/A"),
                rank: getRankInfo?.data?.data?.getRankInfo?.rankName ?? "Unknown",
                referer_code: referal?.data?.data?.getReferralInfo?.referrer_code ?? "-",
                referal_code: referal?.data?.data?.getReferralInfo?.referral_code ?? "-",
                total_referal: referal?.data?.data?.getReferralInfo?.count ?? 0,
                total_referral_karma: referal?.data?.data?.getReferralInfo?.total_referral_karma ?? 0,
                karma_available: karma?.data?.data?.getKarmaPoints ?? 0,
                task: taskList ?? "✅ No pending tasks",
                checkIn: check?.data?.data?.setDailyCheckIn ? "🟢 Checked in today" : "✔️  Already Checked in"
            };
        }));

        resolve(tableData);
    });
}

// Fungsi untuk menampilkan tabel
function renderTable(data) {
    return new Promise((resolve) => {
        const table = new Table({
            columns: [
                { name: "No", alignment: "center", title: "No" },
                { name: "Email", alignment: "left", title: "Email" },
                { name: "rank", alignment: "left", title: "Nama Rank" },
                { name: "referer_code", alignment: "left", title: "Kode Perujuk" },
                { name: "referal_code", alignment: "left", title: "Kode Referal" },
                { name: "total_referal", alignment: "center", title: "Total Referal", color: "cyan" },
                { name: "total_referral_karma", alignment: "center", title: "Referal Karma", color: "cyan" },
                { name: "karma_available", alignment: "center", title: "Total Karma", color: "cyan" },
                { name: "task", alignment: "left", title: "Task yang belum terselesaikan                     ", minWidth: 20, maxWidth: 50, wrapWord: true },
                { name: "checkIn", alignment: "left", title: "Check-In Harian", minWidth: 20, maxWidth: 30, wrapWord: true },
            ],
        });

        table.addRows(data);
        resolve(table.render());
    });
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString("id-ID", { hour12: false });
}

async function countdown(seconds, processId) {
    for (let i = seconds; i > 0; i--) {
        const hours = String(Math.floor(i / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, "0");
        const seconds = String(i % 60).padStart(2, "0");

        twisters.put(processId, { text: `⏳ Menunggu: ${hours}:${minutes}:${seconds} (Saat ini: ${getCurrentTime()})` });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function main() {
    const tableId = "TableId";
    const processId = "ProcessId";
    displayAppTitle()

    try {
       

        while (true){
            twisters.put(processId, { text: "🔄 Checking in..." });
            const accounts = await readAccounts();
            const updatedTable = await updateTableData(accounts);
            const renderedTable = await renderTable(updatedTable);

            twisters.put(tableId, { text: renderedTable });
            updatedTable.forEach(row => {
                row.total_referal = row.total_referal;
                row.karma_available = row.karma_available;
                row.total_referral_karma = row.total_referral_karma;
                row.checkIn = row.checkIn;
                row.rank = row.rank
            });

            const newRenderedTable = await renderTable(updatedTable);
            twisters.put(tableId, { text: newRenderedTable,active: false });
            twisters.put(processId, { text: "✅ Table update completed!\n" + renderedTable });
            await countdown(24 * 60 * 60, processId);

        }

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        twisters.put(processId, { text: "❌ Error: " + error });
    }
}



// Jalankan fungsi
main();
