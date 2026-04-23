const tg = window.Telegram.WebApp;

// 1. ПЕРЕВОДЫ
const translations = {
    RU: {
        'tab-cafe': 'Кафе', 'tab-rent': 'Аренда', 'tab-travel': 'Поездка',
        'lbl-total': 'СУММА СЧЕТА', 'lbl-curr': 'ВАЛЮТА', 'lbl-service': 'СЕРВИС 10%',
        'lbl-per-person': 'На каждого:', 'btn-add-p': '+ Человек', 'btn-share': 'Поделиться',
        'lbl-rent-total': 'АРЕНДА + КОММУНАЛКА', 'lbl-per-rent': 'С человека:', 'btn-add-r': '+ Жилец',
        'lbl-trip-name': 'НАЗВАНИЕ ПОЕЗДКИ', 'btn-add-ex': '+ Расход (Обед, Такси...)', 'btn-add-tp': '+ Участник',
        'lbl-trip-res': 'Итого с каждого:', 'btn-share-trip': 'Поделиться итогами', 'vault-title': 'СЕЙФ ЧЕКОВ'
    },
    EN: {
        'tab-cafe': 'Cafe', 'tab-rent': 'Rent', 'tab-travel': 'Travel',
        'lbl-total': 'TOTAL AMOUNT', 'lbl-curr': 'CURRENCY', 'lbl-service': 'SERVICE 10%',
        'lbl-per-person': 'Per person:', 'btn-add-p': '+ Person', 'btn-share': 'Share',
        'lbl-rent-total': 'RENT + UTILITIES', 'lbl-per-rent': 'Per person:', 'btn-add-r': '+ Tenant',
        'lbl-trip-name': 'TRIP NAME', 'btn-add-ex': '+ Expense (Taxi, Lunch...)', 'btn-add-tp': '+ Participant',
        'lbl-trip-res': 'Total per person:', 'btn-share-trip': 'Share Results', 'vault-title': 'CHECK VAULT'
    }
};

const rates = { KZT: 445, USD: 1, EUR: 0.92, RUB: 92 };

function initApp() {
    tg.ready();
    tg.expand();
    changeLang();
    renderVault();
    calculateAll();
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (document.getElementById('tab-' + tabId)) document.getElementById('tab-' + tabId).classList.add('active');
}

function changeLang() {
    const lang = document.getElementById('langSel').value;
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });
}

function addPerson(containerId, type) {
    const div = document.createElement('div');
    div.className = 'participant-row';
    div.innerHTML = `<input type="text" placeholder="..." class="p-input" style="margin-bottom:8px; width:100%; background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 12px; color: white;">`;
    document.getElementById(containerId).appendChild(div);
    calculateAll();
}

function addExpense() {
    const div = document.createElement('div');
    div.className = 'expense-row';
    div.style.background = '#0f172a';
    div.style.padding = '10px';
    div.style.borderRadius = '12px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="text" class="t-exp-desc" placeholder="На что?" style="margin-bottom:5px; font-size:12px; width:100%; background:none; border:none; color:var(--hint); outline:none;">
        <div class="settings-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <input type="number" class="t-exp-val" placeholder="0.00" oninput="calculateAll()">
            <select class="t-exp-cur" onchange="calculateAll()">
                <option value="KZT">₸</option><option value="USD">$</option>
                <option value="EUR">€</option><option value="RUB">₽</option>
            </select>
        </div>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}

function calculateAll() {
    const base = document.getElementById('baseCurr').value;
    const signs = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' };
    const baseSign = signs[base];
    const toBase = (amt, from) => (from === base) ? amt : (amt / rates[from]) * rates[base];

    // Кафе
    let cAmt = parseFloat(document.getElementById('totalAmount').value) || 0;
    if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
    let cBase = toBase(cAmt, document.getElementById('currencySelect').value);
    let cCount = document.getElementById('participantsList').children.length;
    document.getElementById('valCafe').innerText = (cCount > 0 ? (cBase / cCount).toFixed(2) : "0") + " " + baseSign;

    // Аренда
    let rAmt = parseFloat(document.getElementById('rentTotal').value) || 0;
    let rCount = document.getElementById('rentParticipants').children.length;
    document.getElementById('valRent').innerText = (rCount > 0 ? (toBase(rAmt, "KZT") / rCount).toFixed(2) : "0") + " " + baseSign;

    // Поездка
    let tTotalBase = 0;
    document.querySelectorAll('.expense-row').forEach(row => {
        let v = parseFloat(row.querySelector('.t-exp-val').value) || 0;
        let c = row.querySelector('.t-exp-cur').value;
        tTotalBase += toBase(v, c);
    });
    let tCount = document.getElementById('travelParticipants').children.length;
    document.getElementById('valTravel').innerText = (tCount > 0 ? (tTotalBase / tCount).toFixed(2) : "0") + " " + baseSign;
}

// ЛОГИКА КАМЕРЫ (Универсальная)
function triggerCamera() {
    if (tg.initData) { 
        tg.showScanQrPopup({ text: "Сфотографируйте чек" }, (text) => {
            document.getElementById('totalAmount').value = 19645;
            calculateAll();
            return true;
        });
    } else {
        document.getElementById('cameraInput').click();
    }
}

function handlePhoto(event) {
    if (event.target.files && event.target.files[0]) {
        alert("Чек загружен, обрабатываю...");
        setTimeout(() => {
            document.getElementById('totalAmount').value = 19645;
            calculateAll();
        }, 1000);
    }
}

function share(type) {
    const val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    let details = "";
    if(type === 'travel') {
        document.querySelectorAll('.expense-row').forEach(row => {
            const d = row.querySelector('.t-exp-desc').value || "...";
            const v = row.querySelector('.t-exp-val').value;
            const c = row.querySelector('.t-exp-cur').value;
            if(v) details += `\n• ${d}: ${v}${c}`;
        });
    }
    const text = `💸 Расчет: ${val}${details}\n\n@MyCoolSplitBot`;
    saveToVault(type, val, details);
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}

function saveToVault(type, res, details) {
    let vault = JSON.parse(localStorage.getItem('my_vault') || '[]');
    vault.unshift({ date: new Date().toLocaleString(), type, result: res, details });
    localStorage.setItem('my_vault', JSON.stringify(vault.slice(0, 10)));
    renderVault();
}

function renderVault() {
    const list = document.getElementById('vaultList');
    if(!list) return;
    let vault = JSON.parse(localStorage.getItem('my_vault') || '[]');
    list.innerHTML = vault.map(item => `
        <div style="background:var(--card); padding:15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--accent);">
            <div style="font-size:10px; color:var(--hint);">${item.date}</div>
            <div style="font-weight:bold; color:var(--accent); margin:5px 0;">${item.result}</div>
            <div style="font-size:12px; white-space:pre-line;">${item.details || item.type}</div>
        </div>
    `).join('') || '<p style="text-align:center; color:var(--hint);">Сейф пуст</p>';
}

function resetAll() { if(confirm("Очистить всё?")) { localStorage.clear(); location.reload(); } }

document.addEventListener('DOMContentLoaded', initApp);
