const tg = window.Telegram.WebApp;
tg.expand();

// Базовые настройки и курсы (в идеале тянуть из API, но пока зашьем актуальные)
let rates = { USD: 445, EUR: 480, RUB: 4.8, KZT: 1 };
let currentLang = 'RU';
let participants = { cafe: [], rent: [], travel: [] };

// Загрузка данных при старте
window.onload = () => {
    const saved = localStorage.getItem('splitData');
    if (saved) {
        // Здесь можно восстановить данные, если нужно
    }
    calculateAll();
};

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Добавление участника с сохранением
function addPerson(containerId, type) {
    const div = document.createElement('div');
    div.className = 'participant-row';
    div.innerHTML = `<input type="text" placeholder="Имя" class="p-input" oninput="calculateAll()">`;
    document.getElementById(containerId).appendChild(div);
    participants[type].push(""); 
    calculateAll();
}

// Добавление расхода в поездку с выбором валюты
function addExpense() {
    const div = document.createElement('div');
    div.className = 'settings-grid expense-item';
    div.innerHTML = `
        <input type="number" class="t-exp-val" placeholder="Сумма" oninput="calculateAll()">
        <select class="t-exp-cur" onchange="calculateAll()">
            <option value="KZT">₸</option>
            <option value="USD">$</option>
            <option value="EUR">€</option>
            <option value="RUB">₽</option>
        </select>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}

function calculateAll() {
    const base = 1; // Все считаем к тенге

    // 1. КАФЕ (Конвертация в тенге)
    let cAmt = parseFloat(document.getElementById('totalAmount').value) || 0;
    const cCurr = document.getElementById('currencySelect').value;
    if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
    
    let cTotalInKZT = cCurr === 'KZT' ? cAmt : cAmt * rates[cCurr];
    let cCount = document.getElementById('participantsList').children.length;
    let cRes = cCount > 0 ? Math.round(cTotalInKZT / cCount) : 0;
    document.getElementById('valCafe').innerText = cRes.toLocaleString() + " ₸";

    // 2. АРЕНДА
    let rAmt = parseFloat(document.getElementById('rentTotal').value) || 0;
    let rCount = document.getElementById('rentParticipants').children.length;
    let rRes = rCount > 0 ? Math.round(rAmt / rCount) : 0;
    document.getElementById('valRent').innerText = rRes.toLocaleString() + " ₸";

    // 3. ПОЕЗДКА (Суммируем разные валюты в тенге)
    let tTotalKZT = 0;
    const tExps = document.querySelectorAll('.t-exp-val');
    const tCurs = document.querySelectorAll('.t-exp-cur');
    tExps.forEach((el, i) => {
        let val = parseFloat(el.value) || 0;
        let cur = tCurs[i].value;
        tTotalKZT += cur === 'KZT' ? val : val * rates[cur];
    });
    let tCount = document.getElementById('travelParticipants').children.length;
    let tRes = tCount > 0 ? Math.round(tTotalKZT / tCount) : 0;
    document.getElementById('valTravel').innerText = tRes.toLocaleString() + " ₸";

    // Сохраняем состояние
    localStorage.setItem('splitTotal', cAmt);
}

function openCamera() {
    tg.showScanQrPopup({ text: "Сканируем чек..." }, (text) => {
        document.getElementById('totalAmount').value = 19645; // Твой пример с чека
        calculateAll();
        return true;
    });
}

function share(type) {
    let val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    let msg = `💸 Расчет [${type.toUpperCase()}]\nИтого на каждого: ${val}\nКурс: 1$ = ${rates.USD}₸\n\n@MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(msg)}`);
}
