// Инициализация Telegram SDK
const tg = window.Telegram.WebApp;

// Функция, которая сработает ПЕРВОЙ при загрузке
function initApp() {
    tg.ready();
    tg.expand();
    
    // Загружаем сохраненные настройки
    const saved = JSON.parse(localStorage.getItem('split_it_v2'));
    if (saved) {
        if (document.getElementById('langSel')) document.getElementById('langSel').value = saved.lang || 'RU';
        if (document.getElementById('baseCurr')) document.getElementById('baseCurr').value = saved.base || 'KZT';
        if (document.getElementById('totalAmount')) document.getElementById('totalAmount').value = saved.cafe || '';
    }
    
    // Принудительно вызываем перевод при старте
    changeLang();
    calculateAll();
}

// Запускаем инициализацию
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

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

const rates = { KZT: 445, USD: 1, EUR: 0.92, RUB: 92 };

function changeLang() {
    const langSelect = document.getElementById('langSel');
    if (!langSelect) return;
    
    const lang = langSelect.value;
    const t = translations[lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });
    saveData();
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    const targetBtn = document.getElementById('tab-' + tabId);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');
}

function addPerson(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'participant-row';
    div.innerHTML = `<input type="text" placeholder="..." class="p-input" style="margin-bottom:8px; width:100%; background: #1e293b; border: 1px solid #334155; padding: 12px; border-radius: 12px; color: white;">`;
    container.appendChild(div);
    calculateAll();
}

function addExpense() {
    const container = document.getElementById('travelExpenses');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'settings-grid expense-row';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1fr 1fr';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="number" class="t-exp-val" placeholder="0.00" oninput="calculateAll()" style="width:100%;">
        <select class="t-exp-cur" onchange="calculateAll()" style="width:100%;">
            <option value="KZT">₸</option><option value="USD">$</option>
            <option value="EUR">€</option><option value="RUB">₽</option>
        </select>
    `;
    container.appendChild(div);
}

function calculateAll() {
    const baseEl = document.getElementById('baseCurr');
    if (!baseEl) return;
    
    const base = baseEl.value;
    const signs = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' };
    const baseSign = signs[base];

    const toBase = (amt, from) => {
        if (from === base) return amt;
        const inUSD = amt / rates[from];
        return inUSD * rates[base];
    };

    // Кафе
    const totalAmountEl = document.getElementById('totalAmount');
    const currencySelectEl = document.getElementById('currencySelect');
    const participantsListEl = document.getElementById('participantsList');
    
    if (totalAmountEl && currencySelectEl && participantsListEl) {
        let cAmt = parseFloat(totalAmountEl.value) || 0;
        if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
        let cBase = toBase(cAmt, currencySelectEl.value);
        let cCount = participantsListEl.children.length;
        document.getElementById('valCafe').innerText = (cCount > 0 ? (cBase / cCount).toFixed(2) : "0") + " " + baseSign;
    }

    // Аренда
    const rentTotalEl = document.getElementById('rentTotal');
    const rentParticipantsEl = document.getElementById('rentParticipants');
    if (rentTotalEl && rentParticipantsEl) {
        let rAmt = parseFloat(rentTotalEl.value) || 0;
        let rCount = rentParticipantsEl.children.length;
        document.getElementById('valRent').innerText = (rCount > 0 ? (rAmt / rCount).toFixed(2) : "0") + " " + baseSign;
    }

    // Поездка
    const travelParticipantsEl = document.getElementById('travelParticipants');
    if (travelParticipantsEl) {
        let tTotalBase = 0;
        document.querySelectorAll('.expense-row').forEach(row => {
            let v = parseFloat(row.querySelector('.t-exp-val').value) || 0;
            let c = row.querySelector('.t-exp-cur').value;
            tTotalBase += toBase(v, c);
        });
        let tCount = travelParticipantsEl.children.length;
        document.getElementById('valTravel').innerText = (tCount > 0 ? (tTotalBase / tCount).toFixed(2) : "0") + " " + baseSign;
    }
    saveData();
}

function openCamera() {
    // ВАЖНО: Telegram камера работает только через этот метод
    tg.showScanQrPopup({ text: "Сфотографируйте чек" }, function(text) {
        // Попробуем найти сумму в тексте (упрощенно)
        const amount = text.match(/\d+[\.,]\d+/);
        if (amount) {
            document.getElementById('totalAmount').value = amount[0].replace(',', '.');
            calculateAll();
        }
        tg.closeScanQrPopup();
        return true;
    });
}

function saveData() {
    const state = {
        cafe: document.getElementById('totalAmount')?.value || '',
        lang: document.getElementById('langSel')?.value || 'RU',
        base: document.getElementById('baseCurr')?.value || 'KZT'
    };
    localStorage.setItem('split_it_v2', JSON.stringify(state));
}

function share(type) {
    const val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    const text = `💸 Расчет: ${val}\nСоздано в @MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}
