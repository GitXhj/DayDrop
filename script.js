function encodeData(data) {
    // 先将字符串转换为 UTF-8 编码，再进行 base64 编码
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeData(encoded) {
    try {
        // 先进行 base64 解码，再将 UTF-8 转换回原始字符串
        return JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch (e) {
        return [];
    }
}
        let countdowns = decodeData(localStorage.getItem('countdowns')) || [];
let countupEvents = decodeData(localStorage.getItem('countupEvents')) || [];
        let currentTab = 'countdown';
        let selectedEventIndex = null;

        function getTimeColor(days, isCountup = false) {
            if (!isCountup) {
                if (days <= 7) return 'urgent';
                if (days <= 30) return 'warning';
                return 'safe';
            } else {
                if (days >= 3650) return 'urgent';
                if (days >= 1825) return 'warning';
                return 'safe';
            }
        }

        function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-button').forEach(button => {
        if (tab === 'countdown' && button.textContent === '倒数日') {
            button.classList.add('active');
        } else if (tab === 'countup' && button.textContent === '正数日') {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    updateUI();
}

        function updateUI() {
            const emptyState = document.getElementById('emptyState');
            const countdownList = document.getElementById('countdownList');
            const events = currentTab === 'countdown' ? countdowns : countupEvents;
            
            if (events.length === 0) {
                emptyState.style.display = 'flex';
                countdownList.style.display = 'none';
            } else {
                emptyState.style.display = 'none';
                countdownList.style.display = 'grid';
                
                
                countdownList.innerHTML = events.map((event, index) => {
                    const days = currentTab === 'countdown' ? 
                        calculateDaysLeft(event.date) : 
                        calculateDaysPassed(event.date);
                    const timeClass = getTimeColor(Math.abs(days), currentTab === 'countup');
                    return `
                        <div class="countdown-card ${timeClass}" onclick="showDetailView(${index})">
                            <div class="countdown-info">
                                <div class="countdown-title">${event.title}</div>
                                <div class="countdown-date">${formatDate(event.date)}</div>
                            </div>
                            <div>
                                <div style="font-size: 24px; color: var(--${timeClass}); margin-bottom: 4px; font-weight: 500;">
                                    ${Math.abs(days)}天
                                </div>
                                <button class="delete-btn" onclick="event.stopPropagation(); deleteEvent(${index})">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function showAddModal() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('addModalTitle');
            modalTitle.textContent = currentTab === 'countdown' ? '添加倒数日' : '添加正数日';
            modal.style.display = 'flex';
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('eventTitle').focus();
        }

        function hideAddModal() {
            document.getElementById('addModal').style.display = 'none';
        }

        function showAboutModal() {
            document.getElementById('aboutModal').style.display = 'flex';
        }

        function hideAboutModal() {
            document.getElementById('aboutModal').style.display = 'none';
        }

        function addEvent() {
            const title = document.getElementById('eventTitle').value.trim();
            const date = document.getElementById('eventDate').value;

            if (!title || !date) {
                alert('请填写完整信息');
                return;
            }

            const event = { title, date };
            const events = currentTab === 'countdown' ? countdowns : countupEvents;
            events.push(event);

            if (currentTab === 'countdown') {
                events.sort((a, b) => new Date(a.date) - new Date(b.date));
                localStorage.setItem('countdowns', encodeData(events));
            } else {
                events.sort((a, b) => new Date(b.date) - new Date(a.date));
                localStorage.setItem('countupEvents', encodeData(events));;
            }

            hideAddModal();
            updateUI();
        }

        function deleteEvent(index) {
            if (confirm('确定要删除这个事件吗？')) {
                const events = currentTab === 'countdown' ? countdowns : countupEvents;
                events.splice(index, 1);
                localStorage.setItem(
    currentTab === 'countdown' ? 'countdowns' : 'countupEvents', 
    encodeData(events)
);
                hideDetailView();
                updateUI();
            }
        }

        function calculateDaysLeft(date) {
            const diff = new Date(date) - new Date();
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        function calculateDaysPassed(date) {
            const diff = new Date() - new Date(date);
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        }

        function formatDate(date) {
            return new Date(date).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function showDetailView(index) {
            selectedEventIndex = index;
            const events = currentTab === 'countdown' ? countdowns : countupEvents;
            const event = events[index];
            const detailView = document.getElementById('detailView');
            const days = currentTab === 'countdown' ? 
                calculateDaysLeft(event.date) : 
                calculateDaysPassed(event.date);
            const timeClass = getTimeColor(Math.abs(days), currentTab === 'countup');
            
            document.getElementById('detailTitle').textContent = event.title;
            document.getElementById('detailDate').textContent = formatDate(event.date);
            document.getElementById('detailDays').textContent = `${Math.abs(days)}天`;
            document.getElementById('detailDays').style.color = `var(--${timeClass})`;

            const circle = document.getElementById('progressCircle');
            circle.style.stroke = `var(--${timeClass})`;
            const circumference = 2 * Math.PI * 46;
            const totalDays = 365;
            const progress = Math.max(0, Math.min(1, Math.abs(days) / totalDays));
            
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference * (1 - progress);

            detailView.style.display = 'block';
            detailView.classList.add('slide-in');
        }

        function hideDetailView() {
            const detailView = document.getElementById('detailView');
            detailView.classList.remove('slide-in');
            detailView.classList.add('slide-out');
            setTimeout(() => {
                detailView.style.display = 'none';
                detailView.classList.remove('slide-out');
            }, 300);
        }

        window.onclick = function(event) {
            const addModal = document.getElementById('addModal');
            const aboutModal = document.getElementById('aboutModal');
            if (event.target === addModal) {
                hideAddModal();
            }
            if (event.target === aboutModal) {
                hideAboutModal();
            }
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                hideAddModal();
                hideAboutModal();
                hideDetailView();
            }
        });

        // 初始化界面
        updateUI();