const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// 1. СЛОВАРЬ ПЕРЕВОДОВ
const translations = {
    RU: {
        'tab-cafe': 'Кафе', 'tab-rent': 'Аренда', 'tab-travel': 'Поездка',
        'lbl-total': 'СУММА СЧЕТА', 'lbl-curr': 'ВАЛЮТА ЧЕКА', 'lbl-service': 'СЕРВИС 10%',
        'lbl-per-person': 'На каждого:', 'btn-add-p': '+ Человек', 'btn-share': 'Поделиться',
        'lbl-rent-total': 'АРЕНДА + КОММУНАЛКА', 'lbl-per-rent': 'С человека:', 'btn-add-r': '+ Жилец',
        'lbl-trip-name': 'НАЗВАНИЕ ПОЕЗДКИ', 'btn-add-ex': '+ Расход', 'btn-add-tp': '+ Участник',
        'lbl-trip-res': 'Итого с каждого:', 'btn-share-trip': 'Поделиться итогами'
    },
    EN: {
        'tab-cafe': 'Cafe', 'tab-rent': 'Rent', 'tab-travel': 'Travel',
        'lbl-total': 'TOTAL AMOUNT', 'lbl-curr': 'CURRENCY', 'lbl-service': 'SERVICE 10%',
        'lbl-per-person': 'Per person:', 'btn-add-p': '+ Person', 'btn-share': 'Share',
        'lbl-rent-total': 'RENT + UTILITIES', 'lbl-per-rent': 'Per person:', 'btn-add-r': '+ Tenant',
        'lbl-trip-name': 'TRIP NAME', 'btn-add-ex': '+ Expense', 'btn-add-tp': '+ Participant',
        'lbl-trip-res': 'Total per person:', 'btn-share-trip': 'Share Results'
    }
};

// 2. КУРСЫ ВАЛЮТ (относительно USD)
const rates = { KZT: 445, USD: 1, EUR: 0.92, RUB: 92 };

// Переключение вкладок
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// Смена языка
function changeLang() {
    const lang = document.getElementById('langSel').value;
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });
}

// Добавление участников
function addPerson(containerId, type) {
    const div = document.createElement('div');
    div.className = 'participant-row';
    div.innerHTML = `<input type="text" placeholder="..." class="p-input" style="margin-bottom:8px;">`;
    document.getElementById(containerId).appendChild(div);
    calculateAll();
}

// Добавление расходов (Поездка)
function addExpense() {
    const div = document.createElement('div');
    div.className = 'settings-grid expense-row';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="number" class="t-exp-val" placeholder="0.00" oninput="calculateAll()">
        <select class="t-exp-cur" onchange="calculateAll()">
            <option value="KZT">₸</option><option value="USD">$</option>
            <option value="EUR">€</option><option value="RUB">₽</option>
        </select>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}

// УНИВЕРСАЛЬНЫЙ РАСЧЕТ
function calculateAll() {
    const base = document.getElementById('baseCurr').value;
    const signs = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' };
    const baseSign = signs[base];

    // Конвертер
    const toBase = (amt, from) => {
        if (from === base) return amt;
        const inUSD = amt / rates[from];
        return inUSD * rates[base];
    };

    // 1. Кафе
    let cAmt = parseFloat(document.getElementById('totalAmount').value) || 0;
    if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
    let cBase = toBase(cAmt, document.getElementById('currencySelect').value);
    let cCount = document.getElementById('participantsList').children.length;
    document.getElementById('valCafe').innerText = (cCount > 0 ? (cBase / cCount).toFixed(2) : "0") + " " + baseSign;

    // 2. Аренда
    let rAmt = parseFloat(document.getElementById('rentTotal').value) || 0;
    let rBase = toBase(rAmt, "KZT"); // Аренда обычно в локальной валюте
    let rCount = document.getElementById('rentParticipants').children.length;
    document.getElementById('valRent').innerText = (rCount > 0 ? (rBase / rCount).toFixed(2) : "0") + " " + baseSign;

    // 3. Поездка
    let tTotalBase = 0;
    document.querySelectorAll('.expense-row').forEach(row => {
        let v = parseFloat(row.querySelector('.t-exp-val').value) || 0;
        let c = row.querySelector('.t-exp-cur').value;
        tTotalBase += toBase(v, c);
    });
    let tCount = document.getElementById('travelParticipants').children.length;
    document.getElementById('valTravel').innerText = (tCount > 0 ? (tTotalBase / tCount).toFixed(2) : "0") + " " + baseSign;

    saveData();
}

function openCamera() {
    tg.showScanQrPopup({ text: "Сфотографируйте чек" }, (text) => {
        document.getElementById('totalAmount').value = 19645;
        calculateAll();
        return true; 
    });
}

function resetAll() {
    if(confirm("Очистить все данные?")) {
        localStorage.clear();
        location.reload();
    }
}

function saveData() {
    const state = {
        cafe: document.getElementById('totalAmount').value,
        lang: document.getElementById('langSel').value,
        base: document.getElementById('baseCurr').value
    };
    localStorage.setItem('split_it_v2', JSON.stringify(state));
}

// Загрузка сохраненного
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem('split_it_v2'));
    if (saved) {
        document.getElementById('langSel').value = saved.lang || 'RU';
        document.getElementById('baseCurr').value = saved.base || 'KZT';
        document.getElementById('totalAmount').value = saved.cafe || '';
        changeLang();
    }
};

function share(type) {
    const val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    const text = `💸 Расчет: ${val}\nСоздано в @MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}
