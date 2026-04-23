const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let counts = { cafe: 0, rent: 0, travel: 0 };

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Добавление людей
function addPerson(containerId, type) {
    counts[type]++;
    const div = document.createElement('div');
    div.innerHTML = `<input type="text" placeholder="Имя" class="p-input" oninput="calculateAll()">`;
    document.getElementById(containerId).appendChild(div);
    calculateAll();
}

// Добавление расходов в Поездке
function addExpense() {
    const div = document.createElement('div');
    div.className = 'settings-grid';
    div.innerHTML = `
        <input type="number" class="t-exp-val" placeholder="Сумма" oninput="calculateAll()">
        <select onchange="calculateAll()"><option>₸</option><option>$</option></select>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}

// Функция камеры
function openCamera() {
    tg.showScanQrPopup({ text: "Сфотографируйте чек" }, (text) => {
        // Имитация распознавания для демонстрации
        document.getElementById('totalAmount').value = 19645; 
        calculateAll();
        tg.closeScanQrPopup();
    });
}

// Универсальный расчет
function calculateAll() {
    // 1. Кафе
    let cAmt = parseFloat(document.getElementById('totalAmount').value) || 0;
    if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
    let cRes = counts.cafe > 0 ? Math.round(cAmt / counts.cafe) : 0;
    document.getElementById('valCafe').innerText = cRes.toLocaleString() + " ₸";

    // 2. Аренда
    let rAmt = parseFloat(document.getElementById('rentTotal').value) || 0;
    let rRes = counts.rent > 0 ? Math.round(rAmt / counts.rent) : 0;
    document.getElementById('valRent').innerText = rRes.toLocaleString() + " ₸";

    // 3. Поездка
    let tTotal = 0;
    document.querySelectorAll('.t-exp-val').forEach(el => tTotal += parseFloat(el.value) || 0);
    let tRes = counts.travel > 0 ? Math.round(tTotal / counts.travel) : 0;
    document.getElementById('valTravel').innerText = tRes.toLocaleString() + " ₸";
}

// Слушатели для первой вкладки
document.getElementById('totalAmount').addEventListener('input', calculateAll);
document.getElementById('serviceTax').addEventListener('change', calculateAll);

function share(type) {
    let val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    let text = `💸 Счет разделен (${type})!\nИтого на каждого: ${val}\n\nПосчитано через @MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}
