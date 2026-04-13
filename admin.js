const dialogOverlay = document.getElementById('customDialog');
        const dialogBox = document.getElementById('customDialogBox');

        function openDialog(config) {
            const iconDiv = document.getElementById('dialogIcon');
            const titleDiv = document.getElementById('dialogTitle');
            const msgDiv = document.getElementById('dialogMessage');
            const btnDiv = document.getElementById('dialogButtons');
            
            const inputContainer = document.getElementById('dialogInputsContainer'); 
            const inputId = document.getElementById('dialogInputId');
            const inputName = document.getElementById('dialogInputName'); 
            const inputGroup = document.getElementById('dialogInputGroup'); 

            titleDiv.innerText = config.title || '系统提示';
            msgDiv.innerText = config.message || '';

            if(config.type === 'success') {
                iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-green-100 text-green-500";
                iconDiv.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if(config.type === 'warning' || config.type === 'confirm') {
                iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-amber-100 text-amber-500";
                iconDiv.innerHTML = '<i class="fa-solid fa-exclamation"></i>';
            } else if(config.type === 'error') {
                iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-rose-100 text-rose-500";
                iconDiv.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            } else if(config.type === 'edit') {
                iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-blue-100 text-blue-500";
                iconDiv.innerHTML = '<i class="fa-solid fa-pen"></i>';
            } else {
                iconDiv.className = "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center text-3xl bg-indigo-100 text-indigo-500";
                iconDiv.innerHTML = '<i class="fa-solid fa-info"></i>';
            }

            if(config.type === 'edit') {
                inputContainer.classList.remove('hidden');
                inputContainer.classList.add('flex');
                inputGroup.value = config.defaultGroup || '-'; 
                inputId.value = config.defaultId || '';
                inputName.value = config.defaultName || '';
                setTimeout(() => inputName.focus(), 300);
            } else {
                if(inputContainer) {
                    inputContainer.classList.add('hidden');
                    inputContainer.classList.remove('flex');
                }
            }

            btnDiv.innerHTML = '';
            if(config.type === 'confirm' || config.type === 'edit') {
                const cancelBtn = document.createElement('button');
                cancelBtn.className = "flex-1 py-2.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors";
                cancelBtn.innerText = "取消";
                cancelBtn.onclick = closeDialog;
                btnDiv.appendChild(cancelBtn);

                const confirmBtn = document.createElement('button');
                confirmBtn.className = "flex-1 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md active:scale-95";
                confirmBtn.innerText = "确定";
                confirmBtn.onclick = () => { 
                    closeDialog(); 
                    if(config.onConfirm) {
                        config.type === 'edit' ? config.onConfirm(inputId.value, inputName.value, inputGroup.value) : config.onConfirm();
                    }
                };
                btnDiv.appendChild(confirmBtn);
            } else {
                const okBtn = document.createElement('button');
                okBtn.className = "w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md active:scale-95";
                okBtn.innerText = "我知道了";
                okBtn.onclick = closeDialog;
                btnDiv.appendChild(okBtn);
            }

            dialogOverlay.classList.remove('hidden');
            setTimeout(() => { dialogOverlay.classList.remove('opacity-0'); dialogBox.classList.remove('scale-95'); }, 10);
        }

        function closeDialog() {
            dialogOverlay.classList.add('opacity-0'); dialogBox.classList.add('scale-95');
            setTimeout(() => { dialogOverlay.classList.add('hidden'); }, 300);
        }

        window.customAlert = function(msg, type='info', title='系统提示') { openDialog({message: msg, type: type, title: title}); };
        window.customConfirm = function(msg, onConfirm, title='确认操作') { openDialog({message: msg, type: 'confirm', title: title, onConfirm: onConfirm}); };
        window.customEditPrompt = function(msg, defaultId, defaultName, defaultGroup, onConfirm, title='编辑资料') { openDialog({message: msg, type: 'edit', defaultId: defaultId, defaultName: defaultName, defaultGroup: defaultGroup, title: title, onConfirm: onConfirm}); }; 

        const ADMIN_CREDENTIALS = { id: "admin", password: "UTSCF2026" };
        const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;
        let idleTimer = null;

        function startIdleTimer() {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                if (sessionStorage.getItem('isLoggedIn') === 'true') {
                    sessionStorage.removeItem('isLoggedIn');
                    hideDashboard();
                    customAlert("由于您长时间未操作，出于安全考虑，系统已自动登出。", "warning", "自动登出提示");
                }
            }, IDLE_TIMEOUT_MS);
        }

        function stopIdleTimer() { if (idleTimer) clearTimeout(idleTimer); }
        function resetTimerOnAction() { if (sessionStorage.getItem('isLoggedIn') === 'true') { startIdleTimer(); } }

        document.addEventListener('mousemove', resetTimerOnAction);
        document.addEventListener('keydown', resetTimerOnAction);
        document.addEventListener('click', resetTimerOnAction);
        document.addEventListener('scroll', resetTimerOnAction);

        function checkAuthStatus() { if (sessionStorage.getItem('isLoggedIn') === 'true') { showDashboard(); startIdleTimer(); } }

        function handleLogin() {
            const enteredId = document.getElementById('adminUserId').value.trim().toUpperCase();
            const enteredPass = document.getElementById('adminPassword').value.trim();
            const errorMsg = document.getElementById('loginError');
            const btn = document.getElementById('loginBtn');

            if (enteredId === ADMIN_CREDENTIALS.id.toUpperCase() && enteredPass === ADMIN_CREDENTIALS.password) {
                errorMsg.classList.add('hidden');
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
                setTimeout(() => {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    showDashboard(); startIdleTimer(); 
                    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Secure Login';
                    document.getElementById('adminUserId').value = ""; document.getElementById('adminPassword').value = "";
                }, 500); 
            } else {
                errorMsg.classList.remove('hidden');
                const loginBox = document.querySelector('.glass-login');
                loginBox.classList.add('animate-[pulse_0.2s_ease-in-out_2]');
                setTimeout(() => loginBox.classList.remove('animate-[pulse_0.2s_ease-in-out_2]'), 400);
            }
        }

        function handleLogout() {
            customConfirm("您确定要退出 Admin 控制台吗？", () => {
                sessionStorage.removeItem('isLoggedIn');
                stopIdleTimer(); hideDashboard();
            }, "退出登录");
        }

        function showDashboard() {
            document.getElementById('loginScreen').classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                document.getElementById('loginScreen').classList.add('hidden');
                const dash = document.getElementById('adminDashboard');
                dash.classList.remove('hidden');
                setTimeout(() => dash.classList.remove('opacity-0'), 50);
            }, 500);
        }

        function hideDashboard() {
            document.getElementById('adminDashboard').classList.add('opacity-0');
            setTimeout(() => {
                document.getElementById('adminDashboard').classList.add('hidden');
                const login = document.getElementById('loginScreen');
                login.classList.remove('hidden');
                setTimeout(() => login.classList.remove('opacity-0', 'pointer-events-none'), 50);
            }, 500);
        }

        window.onload = checkAuthStatus;
        document.getElementById("adminPassword").addEventListener("keypress", function(event) { if (event.key === "Enter") { event.preventDefault(); handleLogin(); } });

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

        const datePicker = flatpickr("#dateFilter", { dateFormat: "Y-m-d", disableMobile: true, onChange: function(selectedDates, dateStr, instance) { handleDateSelection(); }});
        flatpickr("#reportStartDate", { dateFormat: "Y-m-d", disableMobile: true });
        flatpickr("#reportEndDate", { dateFormat: "Y-m-d", disableMobile: true });

        let allRecords = []; 
        let activeListeners = []; 
        let adminAutoCloseTimer = null; 
        let adminDisplayTimerInterval = null;
        let currentManualDate = ""; 
        let qrCodeInstance = null; 
        let isManageMode = false;
        let hasPlayedAudio = false;

        let currentSortColumn = 'time'; 
        let currentSortOrder = 'desc';  

        let currentReportData = [];
        let currentReportSessions = 0;

        db.collection("Sessions").doc("Class_01").onSnapshot((doc) => {
            const badge = document.getElementById("statusBadge");
            const timerContainer = document.getElementById("adminTimerContainer");
            const timeDisplay = document.getElementById("adminTimeDisplay");
            const audioPlayer = document.getElementById("tenseAudio");

            if (adminDisplayTimerInterval) clearInterval(adminDisplayTimerInterval);

            if (doc.exists && doc.data().status === "Open") {
                badge.innerHTML = '<i class="fa-solid fa-circle text-[10px] text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] rounded-full"></i> <span class="hidden sm:inline">正在允许签到 (Open)</span><span class="sm:hidden">Open</span>';
                badge.className = "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white border border-white/20 flex items-center gap-2 transition-all";
                
                const endTime = doc.data().endTime;
                if (endTime) {
                    timerContainer.classList.remove('hidden');
                    adminDisplayTimerInterval = setInterval(() => {
                        const now = new Date().getTime();
                        const distance = endTime - now;
                        if (distance <= 0) {
                            clearInterval(adminDisplayTimerInterval);
                            timeDisplay.innerText = "00:00";
                            if (audioPlayer) { audioPlayer.pause(); audioPlayer.currentTime = 0; }
                        } else {
                            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                            timeDisplay.innerText = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
                            
                            if (distance <= 15000 && distance > 0 && !hasPlayedAudio) {
                                if (audioPlayer) {
                                    audioPlayer.volume = 0.5;
                                    audioPlayer.play().catch(e => console.log("浏览器限制自动播放"));
                                    hasPlayedAudio = true;
                                }
                            }
                        }
                    }, 1000);
                }
            } else {
                badge.innerHTML = '<i class="fa-solid fa-circle text-[10px] text-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)] rounded-full"></i> <span class="hidden sm:inline">签到已关闭 (Closed)</span><span class="sm:hidden">Closed</span>';
                badge.className = "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 text-white border border-white/20 flex items-center gap-2 transition-all";
                if (timerContainer) timerContainer.classList.add('hidden');
                
                if (audioPlayer) { audioPlayer.pause(); audioPlayer.currentTime = 0; }
            }
        });

        function changeStatus(newStatus) {
            let pinValue = "";
            let dataToUpdate = { status: newStatus };

            if (adminAutoCloseTimer) { clearTimeout(adminAutoCloseTimer); adminAutoCloseTimer = null; }

            if (newStatus === "Open") {
                pinValue = document.getElementById('adminPin').value.trim();
                if (pinValue === "") {
                    customAlert("请先输入 4 位数的 PIN 码，然后再开启签到！", "warning", "缺少 PIN 码");
                    document.getElementById('adminPin').focus();
                    return;
                }

                // 🌟 读取秒数，并至少给 10 秒防呆
                let durationSeconds = parseInt(document.getElementById('adminDuration').value) || 60;
                if (durationSeconds < 10) durationSeconds = 10; 

                dataToUpdate.currentPin = pinValue;
                // 🌟 将输入的秒数转换为毫秒加到当前时间
                dataToUpdate.endTime = new Date().getTime() + (durationSeconds * 1000); 
                hasPlayedAudio = false;

                const audioPlayer = document.getElementById("tenseAudio");
                if (audioPlayer) {
                    audioPlayer.volume = 0.5; 
                    audioPlayer.play().then(() => {
                        audioPlayer.pause();
                        audioPlayer.currentTime = 0;
                    }).catch(e => {});
                }

                // 🌟 按照自定义时间（秒）倒数关门
                adminAutoCloseTimer = setTimeout(() => { changeStatus('Closed'); }, durationSeconds * 1000);
            } else {
                document.getElementById('adminPin').value = "";
                dataToUpdate.endTime = 0;
                
                const audioPlayer = document.getElementById("tenseAudio");
                if (audioPlayer) {
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0; 
                }
            }

            db.collection("Sessions").doc("Class_01").set(dataToUpdate, { merge: true })
            .catch(error => customAlert("操作失败: " + error.message, "error", "系统异常"));
        }

        function loadDataForDates(dateArray) {
            activeListeners.forEach(unsub => unsub());
            activeListeners = [];
            allRecords = []; 
            renderTable(); 

            if (dateArray.length === 0) return;

            dateArray.forEach((dateString) => {
                const unsub = db.collection("Attendance").doc(dateString).collection("Students").orderBy("timestamp", "desc").onSnapshot((studentSnapshot) => {
                      allRecords = allRecords.filter(r => r.dateString !== dateString);
                      studentSnapshot.forEach((studentDoc) => {
                          const data = studentDoc.data();
                          if (data.timestamp) {
                              const jsDate = data.timestamp.toDate();
                              allRecords.push({
                                  studentId: data.studentId, 
                                  studentName: data.studentName, 
                                  groupNumber: data.groupNumber || '-', 
                                  fullDateObj: jsDate, 
                                  dateString: dateString, 
                                  timeString: jsDate.toLocaleTimeString('zh-CN', { hour12: false })
                              });
                          }
                      });
                      
                      executeSort(); 
                      renderTable(); 
                  });
                activeListeners.push(unsub);
            });
        }

        function handleDateSelection() {
            const selectedDate = document.getElementById("dateFilter").value;
            if (selectedDate) { loadDataForDates([selectedDate]); } else { loadDataForDates([]); }
        }

        function clearDateFilter() { datePicker.clear(); handleDateSelection(); }

        function handleSortClick(column) {
            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortOrder = column === 'time' ? 'desc' : 'asc';
            }
            executeSort();
            renderTable();
        }

        function executeSort() {
            allRecords.sort((a, b) => {
                let valA, valB;
                if (currentSortColumn === 'time') {
                    return currentSortOrder === 'asc' ? a.fullDateObj - b.fullDateObj : b.fullDateObj - a.fullDateObj;
                } else if (currentSortColumn === 'name') {
                    valA = a.studentName; valB = b.studentName;
                } else if (currentSortColumn === 'id') {
                    valA = a.studentId; valB = b.studentId;
                } else if (currentSortColumn === 'group') {
                    valA = a.groupNumber === '-' ? '99' : a.groupNumber;
                    valB = b.groupNumber === '-' ? '99' : b.groupNumber;
                }

                if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        function toggleManageMode() {
            const selectedDate = document.getElementById("dateFilter").value;
            if (!selectedDate || allRecords.length === 0) {
                customAlert("请先选择有数据的日期，才能进行管理！", "warning", "提示");
                return;
            }
            
            isManageMode = !isManageMode;
            const delBtn = document.getElementById('deleteSelectedBtn');
            const mngBtn = document.getElementById('manageBtn');
            
            if (isManageMode) {
                delBtn.classList.remove('hidden');
                mngBtn.classList.remove('bg-white', 'text-blue-700');
                mngBtn.classList.add('bg-blue-600', 'text-white');
                mngBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> 退出管理';
            } else {
                delBtn.classList.add('hidden');
                mngBtn.classList.add('bg-white', 'text-blue-700');
                mngBtn.classList.remove('bg-blue-600', 'text-white');
                mngBtn.innerHTML = '<i class="fa-solid fa-list-check"></i> 管理名单';
            }
            renderTable();
        }

        function toggleAllCheckboxes(source) {
            const checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = source.checked);
        }

        function renderTable() {
            const list = document.getElementById("attendanceList");
            const thead = document.getElementById("tableHeader");
            const selectedDate = document.getElementById("dateFilter").value;
            document.getElementById("studentCount").innerText = allRecords.length;

            if (!selectedDate) {
                list.innerHTML = `<tr><td colspan="${isManageMode ? 6 : 5}" class="p-10 text-center text-slate-500 font-medium"><i class="fa-regular fa-calendar-check text-4xl mb-3 block text-slate-400"></i>请先在上方选择日期以查看签到名单</td></tr>`;
                return;
            }
            if (allRecords.length === 0) {
                list.innerHTML = `<tr><td colspan="${isManageMode ? 6 : 5}" class="p-10 text-center text-slate-500 font-medium"><i class="fa-regular fa-folder-open text-4xl mb-3 block text-slate-400"></i>该日期暂无签到记录</td></tr>`;
                return;
            }

            const getSortIcon = (col) => {
                if (currentSortColumn !== col) return '<i class="fa-solid fa-sort ml-1 opacity-30"></i>';
                return currentSortOrder === 'asc' 
                    ? '<i class="fa-solid fa-sort-up ml-1 text-indigo-600"></i>' 
                    : '<i class="fa-solid fa-sort-down ml-1 text-indigo-600"></i>';
            };

            const theadHtml = `
                <tr class="text-slate-600 text-[11px] uppercase tracking-wider">
                    ${isManageMode ? '<th class="p-3 pl-6 sm:pl-8 w-12"><input type="checkbox" id="selectAll" onclick="toggleAllCheckboxes(this)" class="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"></th>' : ''}
                    <th class="p-3 font-bold ${!isManageMode ? 'pl-6 sm:pl-8' : ''}">Date</th>
                    <th class="p-3 font-bold cursor-pointer hover:text-indigo-600 transition-colors select-none" onclick="handleSortClick('time')">Time ${getSortIcon('time')}</th>
                    <th class="p-3 font-bold text-center cursor-pointer hover:text-indigo-600 transition-colors select-none" onclick="handleSortClick('group')">Group ${getSortIcon('group')}</th>
                    <th class="p-3 font-bold cursor-pointer hover:text-indigo-600 transition-colors select-none" onclick="handleSortClick('id')">Student ID ${getSortIcon('id')}</th>
                    <th class="p-3 font-bold cursor-pointer hover:text-indigo-600 transition-colors select-none" onclick="handleSortClick('name')">Student Name ${getSortIcon('name')}</th>
                    ${isManageMode ? '<th class="p-3 font-bold text-right pr-6 sm:pr-8">Action</th>' : ''}
                </tr>
            `;
            thead.innerHTML = theadHtml;

            let htmlContent = "";
            allRecords.forEach(record => {
                htmlContent += `
                    <tr class="hover:bg-white/60 transition duration-150 border-b border-white/20 last:border-0">
                        ${isManageMode ? `<td class="p-3 pl-6 sm:pl-8 w-12"><input type="checkbox" class="row-checkbox w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer" data-id="${record.studentId}"></td>` : ''}
                        <td class="p-3 ${!isManageMode ? 'pl-6 sm:pl-8' : ''} text-slate-700 font-medium">${record.dateString}</td>
                        <td class="p-3 text-slate-600 font-mono"><span class="bg-white/60 shadow-sm border border-white px-2 py-0.5 rounded text-[11px]">${record.timeString}</span></td>
                        <td class="p-3 text-center font-bold text-emerald-600">
                            ${record.groupNumber !== '-' ? `<span class="bg-emerald-100/80 text-emerald-700 px-2.5 py-1 rounded-md text-xs tracking-wide shadow-sm border border-emerald-200">Group ${record.groupNumber}</span>` : '<span class="text-slate-400 font-normal">-</span>'}
                        </td>
                        <td class="p-3 font-bold text-indigo-700">${record.studentId}</td>
                        <td class="p-3 text-slate-800 font-medium text-[13px]">${record.studentName}</td>
                        ${isManageMode ? `<td class="p-3 text-right pr-6 sm:pr-8">
                            <button onclick="editRecordName('${record.studentId}', '${record.studentName.replace(/'/g, "\\'")}', '${record.groupNumber}')" class="text-indigo-600 hover:text-white bg-indigo-100 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border border-indigo-200 hover:border-indigo-500 active:scale-95">
                                <i class="fa-solid fa-pen mr-1"></i> 编辑
                            </button>
                        </td>` : ''}
                    </tr>`;
            });
            list.innerHTML = htmlContent;
        }

        function openGroupListModal() {
            const selectedDate = document.getElementById("dateFilter").value;
            if (!selectedDate) { customAlert("请先在上方日历中选择你要查看的【日期】！", "warning", "提示"); return; }
            if (allRecords.length === 0) { customAlert("该日期暂无签到记录！", "warning", "提示"); return; }

            const container = document.getElementById("groupListContainer");
            container.innerHTML = ""; 

            for (let i = 1; i <= 8; i++) {
                const groupStudents = allRecords.filter(r => r.groupNumber === i.toString());
                
                let studentListHtml = "";
                if (groupStudents.length === 0) {
                    studentListHtml = `<div class="text-center py-6 text-slate-400 text-xs">暂无学生</div>`;
                } else {
                    groupStudents.forEach(stu => {
                        studentListHtml += `
                            <div class="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                                <span class="font-bold text-[11px] text-slate-700 uppercase leading-tight">${stu.studentName}</span>
                                <span class="text-[10px] font-mono text-slate-400 ml-2">${stu.studentId}</span>
                            </div>
                        `;
                    });
                }

                const cardHtml = `
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-56">
                        <div class="bg-emerald-50 border-b border-emerald-100 px-3 py-2 flex justify-between items-center shrink-0">
                            <span class="font-extrabold text-sm text-emerald-700">Group ${i}</span>
                            <span class="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">${groupStudents.length} 人</span>
                        </div>
                        <div class="p-2 overflow-y-auto flex-1">
                            ${studentListHtml}
                        </div>
                    </div>
                `;
                container.innerHTML += cardHtml;
            }

            document.getElementById('groupListModal').classList.remove('hidden');
        }

        function closeGroupListModal() { document.getElementById('groupListModal').classList.add('hidden'); }

        function editRecordName(oldStudentId, currentName, currentGroup) {
            const selectedDate = document.getElementById("dateFilter").value;
            
            customEditPrompt(`正在修改选中学生的资料\n您可以更改 Group、Student ID 或 姓名：`, oldStudentId, currentName, currentGroup, (newId, newName, newGroup) => {
                newId = newId.trim().toUpperCase();
                newName = newName.trim().toUpperCase();

                if (!newId || !newName) { customAlert("Student ID 和 Name 都不能为空！", "warning", "信息不完整"); return; }
                if (newId.includes('@')) { customAlert("Student ID 不能是 Email 格式！", "warning", "格式错误"); return; }
                if (/\d/.test(newName)) { customAlert("学生姓名不能包含数字！", "warning", "格式错误"); return; }
                if (newName.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newName)) { customAlert("学生姓名不能是 Email 格式！", "warning", "格式错误"); return; }

                if (newId === oldStudentId && newName === currentName && newGroup === currentGroup) {
                    customAlert("资料没有进行任何修改。", "info", "未修改");
                    return;
                }

                const studentRef = db.collection("Attendance").doc(selectedDate).collection("Students").doc(oldStudentId);

                if (newId === oldStudentId) {
                    studentRef.update({ studentName: newName, groupNumber: newGroup }).then(() => {
                        customAlert(`已成功更新资料！`, "success", "修改成功");
                    }).catch(error => { customAlert("修改失败: " + error.message, "error", "系统异常"); });
                } else {
                    studentRef.get().then((docSnapshot) => {
                        if (docSnapshot.exists) {
                            const oldData = docSnapshot.data();
                            const newStudentRef = db.collection("Attendance").doc(selectedDate).collection("Students").doc(newId);
                            const batch = db.batch();
                            
                            batch.set(newStudentRef, { studentId: newId, studentName: newName, groupNumber: newGroup, timestamp: oldData.timestamp });
                            batch.delete(studentRef);
                            
                            batch.commit().then(() => {
                                customAlert(`成功！\nID 变为: ${newId}\n姓名变为: ${newName}\n组别: Group ${newGroup}`, "success", "修改成功");
                            }).catch(error => { customAlert("修改 ID 失败: " + error.message, "error", "系统异常"); });
                        }
                    });
                }
            }, "✍️ 编辑学生资料");
        }

        function deleteSelectedRecords() {
            const selectedDate = document.getElementById("dateFilter").value;
            const checkboxes = document.querySelectorAll('.row-checkbox:checked');
            if (checkboxes.length === 0) {
                customAlert("请先在左侧勾选想要删除的学生记录！", "warning", "未选择记录");
                return;
            }
            customConfirm(`确定要永久删除这 ${checkboxes.length} 条签到记录吗？\n删除后将无法恢复！`, () => {
                const batch = db.batch();
                checkboxes.forEach(cb => {
                    const idToRemove = cb.getAttribute('data-id');
                    const docRef = db.collection("Attendance").doc(selectedDate).collection("Students").doc(idToRemove);
                    batch.delete(docRef);
                });
                batch.commit().then(() => {
                    customAlert(`成功删除了 ${checkboxes.length} 条记录！`, "success", "删除成功");
                    if(document.getElementById('selectAll')) document.getElementById('selectAll').checked = false;
                }).catch(error => {
                    customAlert("批量删除失败: " + error.message, "error", "系统异常");
                });
            }, "🚨 危险操作确认");
        }

        function openQRModal() { document.getElementById('qrModal').classList.remove('hidden'); if (!currentQRUrl) { generateNewQR(); } }
        function closeQRModal() { document.getElementById('qrModal').classList.add('hidden'); }
        function generateNewQR() {
            const baseUrl = "https://nanabanayo028.github.io/CFattendance/index.html"; 
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let randomLetters = '';
            for (let i = 0; i < 6; i++) randomLetters += chars.charAt(Math.floor(Math.random() * chars.length));
            currentQRUrl = `${baseUrl}?q=${randomLetters}`;
            
            const urlDisplay = document.getElementById('qrUrlDisplay');
            if(urlDisplay) urlDisplay.innerText = currentQRUrl;
            
            const box = document.getElementById("qrcode-box"); box.innerHTML = ""; 
            qrCodeInstance = new QRCode(box, { text: currentQRUrl, width: 220, height: 220, colorDark : "#0f172a", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H });
        }

        function openManualModal() {
            const selectedDate = document.getElementById("dateFilter").value;
            if (!selectedDate) { customAlert("请先在上方日历中选择你要进行补签的【日期】！", "warning", "提示"); return; }
            currentManualDate = selectedDate;
            document.getElementById('modalDateDisplay').innerText = selectedDate;
            document.getElementById('manualGroup').value = ""; 
            document.getElementById('manualStuId').value = ""; 
            document.getElementById('manualStuName').value = "";
            document.getElementById('manualCheckInModal').classList.remove('hidden');
            setTimeout(() => document.getElementById('manualStuId').focus(), 100);
        }
        function closeManualModal() { document.getElementById('manualCheckInModal').classList.add('hidden'); }
        
        function submitManualCheckIn() {
            const stuGroup = document.getElementById('manualGroup').value; 
            const stuId = document.getElementById('manualStuId').value.trim().toUpperCase();
            const stuName = document.getElementById('manualStuName').value.trim().toUpperCase();
            
            if (!stuId || !stuName || !stuGroup) { customAlert("Group, Student ID 和 Name 都不能为空！", "warning", "信息不完整"); return; }
            if (stuId.includes('@')) { customAlert("Student ID 不能是 Email 格式！", "warning", "格式错误"); return; }
            if (/\d/.test(stuName)) { customAlert("Student Name 不能包含数字！", "warning", "格式错误"); return; }
            if (stuName.includes('@') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stuName)) { customAlert("Student Name 不能是 Email 格式！", "warning", "格式错误"); return; }
            
            const btn = document.getElementById('submitManualBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 提交中...'; btn.disabled = true;
            
            db.collection("Attendance").doc(currentManualDate).collection("Students").doc(stuId).set({ 
                studentId: stuId, studentName: stuName, groupNumber: stuGroup, timestamp: new Date() 
            }).then(() => { 
                customAlert(`成功补签！\n学生 ${stuName} 已加入 ${currentManualDate} 的名单 (Group ${stuGroup})。`, "success", "补签成功"); 
                closeManualModal(); btn.innerHTML = '<i class="fa-solid fa-check"></i> 确认添加'; btn.disabled = false; 
            }).catch(error => { 
                customAlert("补签失败: " + error.message, "error", "操作异常"); 
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 确认添加'; btn.disabled = false; 
            });
        }

        function openReportModal() {
            document.getElementById('reportModal').classList.remove('hidden');
            document.getElementById('reportListContainer').classList.add('hidden');
            document.getElementById('reportEmpty').classList.remove('hidden');
            document.getElementById('downloadReportBtn').disabled = true;
            
            document.getElementById('reportStartDate').value = "";
            document.getElementById('reportEndDate').value = "";
            document.getElementById('reportTargetCount').value = 4;
        }
        
        function closeReportModal() { document.getElementById('reportModal').classList.add('hidden'); }

        function generateReport() {
            const startDate = document.getElementById('reportStartDate').value;
            const endDate = document.getElementById('reportEndDate').value;
            const targetCount = parseInt(document.getElementById('reportTargetCount').value) || 4;

            if (!startDate || !endDate) { customAlert("请先选择 开始日期 和 结束日期！", "warning", "缺失条件"); return; }
            if (startDate > endDate) { customAlert("开始日期 不能晚于 结束日期！", "warning", "逻辑错误"); return; }

            const btn = document.getElementById('generateReportBtn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 统计中...';
            btn.disabled = true;

            db.collectionGroup("Students").get().then((snapshot) => {
                let uniqueSessions = new Set();
                let studentStats = {};
                // 🌟 新增对各组人数进行计算，这回只算人头，不把打卡次数加起来！
                let groupStats = { '1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0 };

                snapshot.forEach((doc) => {
                    const dateStr = doc.ref.parent.parent.id;
                    
                    if (dateStr >= startDate && dateStr <= endDate) {
                        uniqueSessions.add(dateStr);
                        
                        const data = doc.data(); 
                        const id = data.studentId;
                        const group = data.groupNumber || '-';

                        if (!studentStats[id]) { 
                            studentStats[id] = { id: id, name: data.studentName, group: group, count: 0 }; 
                        }
                        studentStats[id].count++;
                    }
                });

                currentReportSessions = uniqueSessions.size;
                currentReportData = Object.values(studentStats).sort((a, b) => b.count - a.count);
                let qualifiedCount = currentReportData.filter(s => s.count >= targetCount).length;

                // 🌟 这回是拿整理好的名单去算，就不会多加了
                currentReportData.forEach(stu => {
                    if (stu.group >= '1' && stu.group <= '8') {
                        groupStats[stu.group]++;
                    }
                });

                document.getElementById('rs_totalSessions').innerText = currentReportSessions;
                document.getElementById('rs_totalStudents').innerText = currentReportData.length;
                document.getElementById('rs_qualified').innerText = qualifiedCount;

                let groupHtml = "";
                for(let i=1; i<=8; i++) {
                    groupHtml += `
                        <div onclick="openReportGroupDetails('${i}')" class="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex justify-between items-center cursor-pointer hover:bg-emerald-100 hover:shadow-sm transition-all active:scale-95" title="点击查看 Group ${i} 的详细出席名单">
                            <span class="text-[11px] font-bold text-emerald-800">Group ${i}</span>
                            <span class="text-xs font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">${groupStats[i]}</span>
                        </div>
                    `;
                }
                document.getElementById('reportGroupList').innerHTML = groupHtml;

                let studentHtml = "";
                if (currentReportData.length === 0) {
                    studentHtml = `<tr><td colspan="4" class="p-6 text-center text-slate-400">该日期范围内暂无签到记录</td></tr>`;
                } else {
                    currentReportData.forEach(stu => {
                        const isPass = stu.count >= targetCount;
                        const statusBadge = isPass 
                            ? `<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200"><i class="fa-solid fa-check mr-1"></i>达标</span>`
                            : `<span class="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">未达标</span>`;
                        
                        const groupBadge = stu.group !== '-' 
                            ? `<span class="bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border border-emerald-200">G${stu.group}</span>`
                            : `<span class="text-slate-300">-</span>`;

                        studentHtml += `
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="p-2 pl-4 text-center">${groupBadge}</td>
                                <td class="p-2">
                                    <div class="font-bold text-[11px] text-slate-700 uppercase leading-tight">${stu.name}</div>
                                    <div class="text-[9px] font-mono text-slate-400">${stu.id}</div>
                                </td>
                                <td class="p-2 text-center font-extrabold text-blue-600 text-sm">${stu.count}</td>
                                <td class="p-2 pr-4 text-center">${statusBadge}</td>
                            </tr>
                        `;
                    });
                }
                document.getElementById('reportStudentList').innerHTML = studentHtml;

                document.getElementById('reportEmpty').classList.add('hidden');
                document.getElementById('reportListContainer').classList.remove('hidden');
                document.getElementById('downloadReportBtn').disabled = false;

                btn.innerHTML = '<i class="fa-solid fa-rotate"></i> 重新生成';
                btn.disabled = false;

            }).catch(error => { 
                customAlert("报表生成失败: " + error.message, "error", "系统异常"); 
                btn.innerHTML = '<i class="fa-solid fa-bolt"></i> 生成报表';
                btn.disabled = false;
            });
        }

        function openReportGroupDetails(groupNum) {
            if (currentReportData.length === 0) return;

            const groupStudents = currentReportData.filter(stu => stu.group === groupNum);
            
            document.getElementById('rgd_title').innerText = `Group ${groupNum} - 成员出勤详情`;
            
            let listHtml = "";
            if (groupStudents.length === 0) {
                listHtml = `<tr><td colspan="3" class="p-8 text-center text-slate-400">此时间段内，该小组无打卡记录</td></tr>`;
            } else {
                groupStudents.forEach((stu, index) => {
                    listHtml += `
                        <tr class="hover:bg-slate-50 transition-colors">
                            <td class="p-3 pl-6 text-center font-bold text-slate-400">${index + 1}</td>
                            <td class="p-3">
                                <div class="font-bold text-xs text-slate-700 uppercase leading-tight">${stu.name}</div>
                                <div class="text-[10px] font-mono text-slate-400">${stu.id}</div>
                            </td>
                            <td class="p-3 pr-6 text-center font-extrabold text-blue-600 text-base">${stu.count} 次</td>
                        </tr>
                    `;
                });
            }
            
            document.getElementById('rgd_list').innerHTML = listHtml;
            document.getElementById('reportGroupDetailsModal').classList.remove('hidden');
        }

        function closeReportGroupDetailsModal() {
            document.getElementById('reportGroupDetailsModal').classList.add('hidden');
        }

        function exportReportToExcel() {
            const startDate = document.getElementById('reportStartDate').value;
            const endDate = document.getElementById('reportEndDate').value;
            const targetCount = parseInt(document.getElementById('reportTargetCount').value) || 4;

            if (currentReportData.length === 0) { customAlert("没有可导出的数据！", "warning"); return; }
            
            let csvContent = "\uFEFF"; 
            csvContent += `报表范围 (Date Range),${startDate} to ${endDate}\n`;
            csvContent += `总开放签到天数 (Total Sessions),${currentReportSessions}\n`;
            csvContent += `设置达标门槛 (Target Attendances),>= ${targetCount}\n\n`;
            
            csvContent += "组别 (Group),学号 (Student ID),姓名 (Name),出勤次数 (Attendances),是否达标 (Qualified)\n"; 
            
            currentReportData.forEach(stu => { 
                const isPass = stu.count >= targetCount ? "是 (Yes)" : "否 (No)";
                csvContent += `"${stu.group}","${stu.id}","${stu.name}","${stu.count}","${isPass}"\n`; 
            });
            
            triggerDownload(csvContent, `Attendance_Advanced_Report_${startDate}_to_${endDate}.csv`);
        }

        function exportToExcel() {
            const selectedDate = document.getElementById("dateFilter").value;
            if (!selectedDate) { customAlert("请先在上方日历中选择要导出的日期！", "warning", "操作提示"); return; }
            if (allRecords.length === 0) { customAlert(`日期 ${selectedDate} 没有可导出的签到数据！`, "warning", "空数据"); return; }
            
            let csvContent = "\uFEFF日期 (Date),时间 (Time),组别 (Group),学号 (Student ID),姓名 (Name)\n"; 
            allRecords.forEach(record => { csvContent += `"${record.dateString}","${record.timeString}","${record.groupNumber}","${record.studentId}","${record.studentName}"\n`; });
            triggerDownload(csvContent, `Attendance_${selectedDate}.csv`);
        }

        function triggerDownload(content, filename) {
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }

        window.handleSortClick = handleSortClick;
        window.openReportGroupDetails = openReportGroupDetails;
        window.closeReportGroupDetailsModal = closeReportGroupDetailsModal;