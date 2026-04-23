const tg = window.Telegram.WebApp;
tg.expand();

// Актуальные кросс-курсы (условно к USD для удобства расчета между собой)
const ratesToUSD = { KZT: 0.0022, USD: 1, EUR: 1.08, RUB: 0.011 };
let currentLang = 'RU';

const translations = {
    RU: {
        'lbl-total': 'СУММА СЧЕТА', 'lbl-curr': 'ВАЛЮТА ЧЕКА', 'lbl-service': 'СЕРВИС 10%',
        'lbl-per-person': 'На каждого:', 'btn-add-p': '+ Человек', 'btn-share-c': 'Поделиться',
        'lbl-rent-total': 'АРЕНДА + КОММУНАЛКА', 'lbl-per-rent': 'С человека:', 'btn-add-r': '+ Жилец',
        'lbl-trip-name': 'НАЗВАНИЕ ПОЕЗДКИ', 'btn-add-ex': '+ Расход', 'btn-add-tp': '+ Участник',
        'lbl-trip-res': 'Итого с каждого:'
    },
    EN: {
        'lbl-total': 'TOTAL AMOUNT', 'lbl-curr': 'BILL CURRENCY', 'lbl-service': 'SERVICE 10%',
        'lbl-per-person': 'Per person:', 'btn-add-p': '+ Person', 'btn-share-c': 'Share',
        'lbl-rent-total': 'RENT + UTILITIES', 'lbl-per-rent': 'Per person:', 'btn-add-r': '+ Tenant',
        'lbl-trip-name': 'TRIP NAME', 'btn-add-ex': '+ Expense', 'btn-add-tp': '+ Participant',
        'lbl-trip-res': 'Total per person:'
    }
};

function changeLang() {
    currentLang = document.getElementById('langSel').value;
    const t = translations[currentLang];
    for (let id in t) {
        const el = document.getElementById(id);
        if (el) el.innerText = t[id];
    }
}

function calculateAll() {
    const base = document.getElementById('baseCurr').value;
    const baseSign = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' }[base];

    // Функция перевода суммы из любой валюты в выбранную БАЗОВУЮ
    const convert = (amount, from, to) => {
        const inUSD = amount * (1 / (1 / ratesToUSD[from])); 
        return amount * (ratesToUSD[from] / ratesToUSD[to]);
    };

    // 1. КАФЕ
    let cAmt = parseFloat(document.getElementById('totalAmount').value) || 0;
    const cCurr = document.getElementById('currencySelect').value;
    if (document.getElementById('serviceTax').checked) cAmt *= 1.1;
    
    let cTotalInBase = convert(cAmt, cCurr, base);
    let cCount = document.getElementById('participantsList').children.length;
    let cRes = cCount > 0 ? (cTotalInBase / cCount).toFixed(2) : 0;
    document.getElementById('valCafe').innerText = `${cRes} ${baseSign}`;

    // 2. АРЕНДА
    let rAmt = parseFloat(document.getElementById('rentTotal').value) || 0;
    let rCount = document.getElementById('rentParticipants').children.length;
    let rRes = rCount > 0 ? (rAmt / rCount).toFixed(2) : 0;
    document.getElementById('valRent').innerText = `${rRes} ${baseSign}`;

    // 3. ПОЕЗДКА
    let tTotalInBase = 0;
    document.querySelectorAll('.expense-row').forEach(row => {
        let val = parseFloat(row.querySelector('.t-exp-val').value) || 0;
        let cur = row.querySelector('.t-exp-cur').value;
        tTotalInBase += convert(val, cur, base);
    });
    let tCount = document.getElementById('travelParticipants').children.length;
    let tRes = tCount > 0 ? (tTotalInBase / tCount).toFixed(2) : 0;
    document.getElementById('valTravel').innerText = `${tRes} ${baseSign}`;

    saveData();
}

// СОХРАНЕНИЕ В ПАМЯТЬ
function saveData() {
    const data = {
        total: document.getElementById('totalAmount').value,
        base: document.getElementById('baseCurr').value,
        lang: document.getElementById('langSel').value
    };
    localStorage.setItem('split_it_save', JSON.stringify(data));
}

function addExpense() {
    const div = document.createElement('div');
    div.className = 'expense-row settings-grid';
    div.innerHTML = `
        <input type="number" class="t-exp-val" placeholder="Сумма" oninput="calculateAll()">
        <select class="t-exp-cur" onchange="calculateAll()">
            <option value="KZT">₸</option><option value="USD">$</option>
            <option value="EUR">€</option><option value="RUB">₽</option>
        </select>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}
// ... функции openTab, addPerson и share остаются прежними, вызывая calculateAll()
