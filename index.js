const dialogOverlay = document.getElementById('customDialog');
const dialogBox = document.getElementById('customDialogBox');

function customAlert(msg, type='info', title='系统提示') {
    const iconDiv = document.getElementById('dialogIcon');
    const titleDiv = document.getElementById('dialogTitle');
    const msgDiv = document.getElementById('dialogMessage');
    const btnDiv = document.getElementById('dialogButtons');

    titleDiv.innerText = title;
    msgDiv.innerText = msg;

    if(type === 'success') {
        iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-green-100 text-green-500";
        iconDiv.innerHTML = '<i class="fa-solid fa-check"></i>';
    } else if(type === 'warning') {
        iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-amber-100 text-amber-500";
        iconDiv.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
    } else if(type === 'error') {
        iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-rose-100 text-rose-500";
        iconDiv.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-indigo-100 text-indigo-500";
        iconDiv.innerHTML = '<i class="fa-solid fa-info"></i>';
    }

    btnDiv.innerHTML = '';
    const okBtn = document.createElement('button');
    okBtn.className = "w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md active:scale-95";
    okBtn.innerText = "我知道了";
    okBtn.onclick = () => {
        dialogOverlay.classList.add('opacity-0');
        dialogBox.classList.add('scale-95');
        setTimeout(() => { dialogOverlay.classList.add('hidden'); }, 300);
    };
    btnDiv.appendChild(okBtn);

    dialogOverlay.classList.remove('hidden');
    setTimeout(() => {
        dialogOverlay.classList.remove('opacity-0');
        dialogBox.classList.remove('scale-95');
    }, 10);
}

// 🌟 将 Vite 变量换回明文配置，让普通浏览器可以直接读取
const firebaseConfig = {
    apiKey: "AIzaSyBowy5HiYuzmuQnVoiPhM7hvDsAaMSK3a8",
    authDomain: "attendance-a7ac5.firebaseapp.com",
    projectId: "attendance-a7ac5",
    storageBucket: "attendance-a7ac5.firebasestorage.app",
    messagingSenderId: "179755027767",
    appId: "1:179755027767:web:37c6a12e95c8ea0a5b9eb2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const todayStr = new Date().toISOString().split('T')[0]; 
const deviceLockKey = "checkedInTime_" + todayStr;
let timerInterval = null;
let hasAlertedCheat = false; 
let hasPlayedAudio = false; 

let currentSelectedGroup = "";

function isDeviceLocked() {
    const savedTime = localStorage.getItem(deviceLockKey);
    if (!savedTime) return false; 
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - parseInt(savedTime);
    if (timeDifference < 300000) { 
        return true; 
    } else {
        localStorage.removeItem(deviceLockKey);
        return false;
    }
}

window.onload = function() {
    const searchString = window.location.search.substring(1); 
    const mainParam = searchString.split('&')[0]; 
    const authCode = mainParam.split('=')[1]; 

    if (!authCode || authCode.length !== 6) {
        if (timerInterval) clearInterval(timerInterval);
        document.getElementById('checkInForm').classList.add('hidden');
        
        const badge = document.getElementById('statusBadge');
        badge.className = "inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-600 shadow-sm border border-red-200";
        badge.innerHTML = '<i class="fa-solid fa-ban text-xs"></i> 无法访问 (Invalid Access)';
        badge.classList.remove('hidden');
        
        if (!hasAlertedCheat) {
            customAlert("Please scan the QR Code for Attendance", "error", "⚠️ Invalid Access");
            hasAlertedCheat = true;
        }
        return; 
    }

    document.querySelectorAll('.group-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.group-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentSelectedGroup = e.currentTarget.getAttribute('data-group');
        });
    });

    db.collection("Sessions").doc("Class_01").onSnapshot((doc) => {
                const badge = document.getElementById('statusBadge');
                const form = document.getElementById('checkInForm');
                const successMsg = document.getElementById('successMessage');
                const submitBtn = document.getElementById('submitBtn');

                if (isDeviceLocked()) {
                    badge.classList.add('hidden');
                    form.classList.add('hidden');
                    successMsg.classList.remove('hidden');
                    document.getElementById('successDesc').innerText = "You have recently checked in. Please wait 5 minutes.";
                    return; 
                }

                if (doc.exists) {
                    // 🌟 核心防线 1：只要你的二维码跟数据库最新的对不上，直接拉黑踢人！
                    const serverToken = doc.data().currentQRToken;
                    if (serverToken && serverToken !== authCode) {
                        badge.innerHTML = '<i class="fa-solid fa-ban text-xs"></i> 二维码已失效';
                        badge.className = "inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 shadow-sm border border-red-200";
                        form.classList.add('hidden');
                        
                        if (!hasAlertedCheat) {
                            customAlert("该二维码已过期失效！请重新扫描大屏幕上最新的二维码进入。", "error", "⚠️ 链接过期");
                            hasAlertedCheat = true;
                        }
                        return; // 结束执行
                    }

                    if (doc.data().status === "Open") {
                        badge.innerHTML = '<i class="fa-solid fa-lock-open text-xs"></i> Attendance Open';
                        badge.className = "inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200";
                        
                        form.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
                        successMsg.classList.add('hidden');
                        
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm';
                        submitBtn.className = "w-full mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex justify-center items-center gap-2 border border-indigo-400/50";
                    } else {
                        badge.innerHTML = '<i class="fa-solid fa-hourglass-half text-xs"></i> Waiting for access...';
                        badge.className = "inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600 shadow-sm border border-amber-200";
                        
                        badge.classList.remove('hidden');
                        form.classList.add('hidden'); 
                        successMsg.classList.add('hidden'); 
                    }
                }
            });
};

function submitCheckIn() {
    if (isDeviceLocked()) {
        customAlert("您刚刚已经成功签到过了，请耐心等待 5 分钟后再试。", "warning", "操作太频繁");
        return;
    }

    const studentId = document.getElementById('studentId').value.trim().toUpperCase();
    const studentName = document.getElementById('studentName').value.trim().toUpperCase();
    const enteredPin = document.getElementById('pinCode').value.trim();

    if (!studentId || !studentName || !enteredPin) {
        customAlert("请完整填写 Student ID, Name 以及屏幕上的 PIN 码！", "warning", "信息不完整"); 
        return;
    }

    if (currentSelectedGroup === "") {
        customAlert("请选择您的组别 (Group 1-8 或 无组别)！", "warning", "缺少组别"); 
        return;
    }

    if (studentId.includes('@')) {
        customAlert("Student ID 不能是 Email 格式！", "warning", "格式错误");
        return;
    }
    if (/\d/.test(studentName)) {
        customAlert("Student Name 不能包含数字！", "warning", "格式错误");
        return;
    }
    if (studentName.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentName)) {
        customAlert("Student Name 不能是 Email 格式！", "warning", "格式错误");
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    db.collection("Sessions").doc("Class_01").get().then((doc) => {
        if (doc.exists && doc.data().status === "Open") {
            
            // 🌟 核心防线 2：在学生按下 Confirm 瞬间，系统做最后一次查房，拿旧链接的直接拦截！
            const serverToken = doc.data().currentQRToken;
            const searchString = window.location.search.substring(1); 
            const mainParam = searchString.split('&')[0]; 
            const authCode = mainParam.split('=')[1]; 

            if (serverToken && serverToken !== authCode) {
                customAlert("该二维码已过期失效！请重新扫描大屏上最新的二维码。", "error", "验证失败");
                btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm'; 
                btn.disabled = false;
                
                document.getElementById('checkInForm').classList.add('hidden');
                document.getElementById('statusBadge').innerHTML = '<i class="fa-solid fa-ban text-xs"></i> 二维码已失效';
                document.getElementById('statusBadge').className = "inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 shadow-sm border border-red-200";
                return;
            }

            const correctPin = doc.data().currentPin;
            if (enteredPin !== correctPin) {
                customAlert("PIN 码不正确！请查看前方大屏幕获取最新的 4 位数密码。", "error", "验证失败");
                btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm'; 
                btn.disabled = false;
                return; 
            }

            const today = new Date();
            const dateFolderName = today.toISOString().split('T')[0]; 

            db.collection("Attendance")
            .doc(dateFolderName)
            .collection("Students")
            .doc(studentId) 
            .set({
                studentId: studentId, 
                studentName: studentName,
                groupNumber: currentSelectedGroup,
                timestamp: firebase.firestore.FieldValue.serverTimestamp() 
            })
            .then(() => {
                const currentTime = new Date().getTime();
                localStorage.setItem(deviceLockKey, currentTime.toString());

                document.getElementById('checkInForm').classList.add('hidden');
                document.getElementById('statusBadge').classList.add('hidden');
                document.getElementById('successMessage').classList.remove('hidden');
                document.getElementById('successDesc').innerText = "Attendance Submitted Successfully!";
            })
            .catch((error) => {
                customAlert("提交失败: " + error.message, "error", "网络异常");
                btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm'; 
                btn.disabled = false;
            });

        } else {
            customAlert("已关闭,无法提交。", "warning", "签到结束");
            btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm'; 
            btn.disabled = false;
        }
    });
}

window.submitCheckIn = submitCheckIn;