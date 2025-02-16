const axios = require('axios');
const { Table } = require('console-table-printer');
const { on } = require('events');
const fs = require('fs');
const figlet = require('figlet');
const chalk = require('chalk');
const prompts = require("prompts");
const { listEmails, getEmailBody, getDomains, randomEmail } = require('mail-genie');
const { Wallet } = require("ethers");
function generateWallet() {
    const wallet = Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
    };
}

const {
    Twisters,
    LineBuffer,
    terminalSupportsUnicode,
    dots,
    dashes
} = require('twisters');
const twisters = new Twisters({
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
            error: true,
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
            error: true,
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
        "variables": {
            "timezone": "Asia/Jakarta"
        },
        "query": "mutation ($timezone: String) {\n  setDailyCheckIn(timezone: $timezone)\n}\n"
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
            const check = await checkIn(log.data.id_token);
            const karma = await getKarmaPoint(log.data.id_token);
            const referal = await getReferalInfo(log.data.id_token);
            const onBoard = await onBoarding(log.data.id_token);
            const getRankInfo = await getRank(log.data.id_token);
            const taskNotComplite = [];
            onBoard.data.data.getOnboarding.tasks.forEach(task => {
                if (task.completed == false) {
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
                // task: taskList ?? "✅ No pending tasks",
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
                // { name: "task", alignment: "left", title: "Task yang belum terselesaikan                     ", minWidth: 20, maxWidth: 50, wrapWord: true },
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

async function validateRef(koderef) {
    const data = JSON.stringify({ "referral_code": koderef });

    try {
        const response = await axios.post("https://prod.haha.me/users/validate", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function regis(email, pass) {
    const data = JSON.stringify({
        "ClientId": "heb0eptuhmis6p9ob6f8g3n",
        "Username": email,
        "Password": pass,
        "UserAttributes": [
            { "Name": "email", "Value": email }
        ],
        "ValidationData": []
    });

    try {
        const response = await axios.post("https://cognito-idp.us-east-1.amazonaws.com", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "x-amz-target": "AWSCognitoIdentityProviderService.SignUp",
                "x-amz-user-agent": "aws-amplify/5.0.4 react-native",
                "cache-control": "no-store",
                "content-type": "application/x-amz-json-1.1"
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function confirmEmail(email, code) {
    const data = JSON.stringify({
        "ClientId": "heb0eptuhmis6p9ob6f8g3n",
        "ConfirmationCode": code,
        "Username": email,
        "ForceAliasCreation": true
    });

    try {
        const response = await axios.post("https://cognito-idp.us-east-1.amazonaws.com", data, {
            headers: {
                "Connection": "keep-alive",
                "Accept": "*/*",
                "Accept-Encoding": "gzip",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
                "x-request-source-extra": "android",
                "x-amz-target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
                "x-amz-user-agent": "aws-amplify/5.0.4 react-native",
                "cache-control": "no-store",
                "content-type": "application/x-amz-json-1.1"
            }
        });

        return {
            error: false,
            data: response.data
        };
    } catch (error) {
        return {
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function saveReferal(refcode, bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {
            "referring_code": refcode,
            "platform": ""
        },
        "query": "mutation ($referring_code: String!, $platform: String) {\n  trackReferral(platform: $platform, referring_code: $referring_code)\n}\n"
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
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function importWallet(address, bearer) {
    const platformIds = [...new Set([
        3890, 27716, 1839, 1027, 11841, 5805, -27716, -1027, -3890,
        3890, 27716, 1027, 1839, 11841, 5805, -27716, -3890, -1027
    ])];

    const requests = platformIds.map(async (platformId) => {
        const data = JSON.stringify({
            "operationName": "importInput",
            "variables": {
                "input": {
                    "platform_id": platformId,
                    "wallet_address": address,
                    "is_haha_wallet": true,
                    "is_smart_wallet": false
                }
            },
            "query": `mutation importInput($input: WalletInput!) {
                importWallet(importInput: $input) {
                    import_status
                    all_transactions_status
                    __typename
                }
            }`
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
                platform_id: platformId,
                error: false,
                data: response.data
            };
        } catch (error) {
            return {
                platform_id: platformId,
                error: true,
                data: error.response?.data || error.message
            };
        }
    });

    const results = await Promise.all(requests);

    return results[results.length - 1]; // Hanya mengembalikan hasil terakhir
}


function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function hasMobileWallet(bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {
            "flag": "has_mobile_wallet"
        },
        "query": "mutation ($flag: UserFlag) {\n  createUserFlag(flag: $flag)\n}\n"
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
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function setUser(first_name, last_name, bearer) {
    const data = JSON.stringify({
        "operationName": null,
        "variables": {
            "saveUserUserInput": {
                "first_name": first_name,
                "last_name": last_name
            }
        },
        "query": "mutation ($saveUserUserInput: UserInput!) {\n  saveUser(userInput: $saveUserUserInput) {\n    first_name\n    last_name\n    email\n    __typename\n  }\n}\n"
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
            error: true,
            data: error.response?.data || error.message
        };
    }
}

async function register(email, pass, koderef, name) {
    try {
        console.log("      📝 Memulai proses registrasi untuk email " + email);
        const regiss = await regis(email, pass);
        console.log(`      ⏳  Menunggu kode konfirmasi`);
        await delay(20)
        const lis = await listEmails(email);
        if (lis.length === 0) {
            console.log(chalk.red(`      ❌ Email konfirmasi tidak ditemukan`));
            return false;
        }
        const code = lis[0].body.plaintext.match(/\d+/)[0];
        console.log(`      📩  Kode konfirmasi ditemukan: ${code}`);
        const emailConfirm = await confirmEmail(email, code);
        if (emailConfirm.error) {
            console.log(chalk.red(`      ❌ Email gagal dikonfirmasi`));
            return false;
        }
        console.log(`      ✅  Email berhasil dikonfirmasi`);
        console.log(`      🔓  Mencoba untuk login`);
        const log = await login(email, pass);
        if (log.error) {
            console.log(chalk.red(`      ❌ Gagal Login`));
            return false;
        }
        const rs = name.split('.');
        let respons;
        const seuser = await setUser(rs[0], rs[1], log.data.id_token);
        const mobile = await hasMobileWallet(log.data.id_token);
        const ref = await saveReferal(koderef, log.data.id_token);
        const my = generateWallet();
        const saveWallet = await importWallet(my.address, log.data.id_token);
        if (ref.error === false && saveWallet.error === false) {
            console.log(`      ✅  Registrasi akun dan wallet berhasil ditambahkan`);
            return {
                "email": email,
                "password": pass,
                "wallet": my
            };
        } else if (ref.error === false) {
            console.log(`      ✅  Registrasi berhasil`);
            return {
                "email": email,
                "password": pass,
                "wallet": null
            };
        }
        return false;
    } catch (err) {
        console.log(chalk.red(`      ❌ Error ${err}`))
        return false;
    }

}

async function saveAcount(newData) {
    const filePath = "accounts.json";

    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
        }
        const existingData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        existingData.push(newData);
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    } catch (err) {
        console.error("❌ Gagal menyimpan data:", err);
    }
}


function autoRef(jumlahReff, password, domainEmail) {
    return new Promise(async (resolve, reject) => {
        try {
            const accounts = await readAccounts("primary_accounts.json");

            for (const account of accounts) {
                console.log(`🔑 Proses akun: ${account.email}`);
                const akunLog = await login(account.email, account.password);

                const getRef = await getReferalInfo(akunLog.data.id_token);
                const kodeRefnya = getRef?.data?.data?.getReferralInfo?.referral_code;
                const validateReff = await validateRef(kodeRefnya)
                if (getRef.error || !kodeRefnya || validateReff.error) {
                    console.warn(chalk.yellow(`⚠️ Kode referal tidak valid`))
                }

                if (akunLog.error) {
                    console.log(chalk.red(`❌ Gagal login: ${account.email}`));
                    continue;
                }

                for (let i = 0; i < jumlahReff; i++) {
                    console.log(`   ➡️  Mengirim referal ke akun: ${account.email}, Reff ke-${i + 1}`);
                    const rand = randomEmail(domainEmail);
                    const regcuk = await register(rand.email, password, kodeRefnya, rand.name);

                    if (regcuk === false) {
                        console.log(chalk.red(`   ❌ Gagal registrasi untuk email : ${rand.email}`));
                        continue;
                    }
                    await saveAcount(regcuk);
                }
                console.log(chalk.green(`🎉 Kode referal untuk akun ${account.email} telah ditambahkan sebanyak ${jumlahReff}`))
            }

            console.log("✅ Semua referal telah dikirim!");
            resolve(); // Menyelesaikan Promise setelah semua proses selesai
        } catch (err) {
            console.error("❌ Terjadi kesalahan:", err);
            reject(err); // Menolak Promise jika terjadi error
        }
    });
}

async function main() {
    const tableId = "TableId";
    const processId = "ProcessId";
    displayAppTitle();
    const pilih = await prompts({
        type: "select",
        name: "menu",
        message: "Mau pake yang mana:",
        choices: [
            { title: "🔗 Auto Referral", value: "auto_referral" },
            { title: "🎁 Auto Daily Claim Karma", value: "auto_daily_claim" }
        ]
    });
    if (pilih.menu === 'auto_referral') {
        const cocote = await prompts([
            {
                type: "number",
                name: "jumlahref",
                message: "Berapa jumlah Ref untuk setiap akun? "
            },
            {
                type: "text",
                name: "password",
                message: "Masukan password untuk akun refferal: ",
                initial: "Pastikan mengantuk Huruf besar,kecil, dan angka"
            },
            {
                type: "text",
                name: "emaildom",
                message: "Domain email:  ",
                initial: "Silahkan pergi ke https://generator.email/ untuk mendapatkan domain email"
            }
        ]);

        await autoRef(cocote.jumlahref, cocote.password, cocote.emaildom)
    } else {
        try {


            while (true) {
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
                twisters.put(tableId, { text: newRenderedTable, active: false });
                twisters.put(processId, { text: "✅ Table update completed!\n" + renderedTable });
                await countdown(24 * 60 * 60, processId);

            }

        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            twisters.put(processId, { text: "❌ Error: " + error });
        }
    }


}



// Jalankan fungsi
main();
