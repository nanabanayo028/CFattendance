// 🌟 1. 系统通用高级弹窗组件
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


// 🌟 2. 初始化 Firebase
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

// 🌟 3. 全局状态变量
const todayStr = new Date().toISOString().split('T')[0]; 
const deviceLockKey = "checkedInTime_" + todayStr;
let timerInterval = null;
let hasAlertedCheat = false; 
let hasPlayedAudio = false;

// 防止重复签到机制
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

// 🌟 4. 页面加载与防作弊检查
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

    db.collection("Sessions").doc("Class_01").onSnapshot((doc) => {
        const badge = document.getElementById('statusBadge');
        const form = document.getElementById('checkInForm');
        const successMsg = document.getElementById('successMessage');
        const timerContainer = document.getElementById('countdownTimer');
        const timeDisplay = document.getElementById('timeDisplay');
        const audioPlayer = document.getElementById("tenseAudio");

        if (timerInterval) clearInterval(timerInterval);

        if (doc.exists && doc.data().status === "Open") {
            
            if (isDeviceLocked()) {
                badge.classList.add('hidden');
                form.classList.add('hidden');
                if (timerContainer) timerContainer.classList.add('hidden');
                successMsg.classList.remove('hidden');
                document.getElementById('successDesc').innerText = "You have recently checked in. Please wait 5 minutes.";
                return; 
            }

            const endTime = doc.data().endTime; 

            if (endTime - new Date().getTime() > 10000) {
                hasPlayedAudio = false;
            }

            timerInterval = setInterval(() => {
                const now = new Date().getTime();
                const distance = endTime - now;

                if (distance <= 0) {
                    clearInterval(timerInterval);
                    timeDisplay.innerText = "00:00";
                    form.classList.add('opacity-50', 'pointer-events-none');
                    
                    if (audioPlayer) {
                        audioPlayer.pause();
                        audioPlayer.currentTime = 0;
                    }
                } else {
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    timeDisplay.innerText = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);

                    // 🌟 修复：最后 15 秒才播放一半音量的音乐！
                    if (distance <= 15000 && distance > 0 && !hasPlayedAudio) {
                        if (audioPlayer) {
                            audioPlayer.volume = 0.5; // 50% 音量
                            audioPlayer.play().catch(e => console.log("学生需要轻触屏幕后才能自动播放音效"));
                            hasPlayedAudio = true;
                        }
                    }
                }
            }, 1000);

            badge.innerHTML = '<i class="fa-solid fa-lock-open text-xs"></i> Attendance Open';
            badge.className = "inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700 shadow-sm border border-green-200";
            
            badge.classList.remove('hidden');
            form.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
            if (timerContainer) timerContainer.classList.remove('hidden');
            successMsg.classList.add('hidden');

        } else {
            badge.innerHTML = '<i class="fa-solid fa-hourglass-half text-xs"></i> Waiting for access...';
            badge.className = "inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-100 text-amber-600 shadow-sm border border-amber-200";
            
            badge.classList.remove('hidden'); 
            form.classList.add('hidden');     
            if (timerContainer) timerContainer.classList.add('hidden'); 
            successMsg.classList.add('hidden'); 
            
            if (audioPlayer) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }
        }
    });
};

// 🌟 5. 提交表单功能
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

    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    db.collection("Sessions").doc("Class_01").get().then((doc) => {
        if (doc.exists && doc.data().status === "Open") {
            
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