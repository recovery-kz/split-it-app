const tg = window.Telegram.WebApp;
tg.expand();

// Настройки языков
const langData = {
    ru: { cafe: "Кафе", rent: "Аренда", travel: "Поездка", sum: "Сумма счета", rentSum: "Аренда + Комм", tripN: "Название трипа", curr: "Валюта", tax: "Сервис 10%", addP: "+ Человек", addE: "+ Расход", share: "Поделиться", per: "На каждого:" },
    en: { cafe: "Cafe", rent: "Rent", travel: "Travel", sum: "Bill Amount", rentSum: "Rent + Utility", tripN: "Trip Name", curr: "Currency", tax: "Service 10%", addP: "+ Person", addE: "+ Expense", share: "Share", per: "Per person:" }
};

// Курсы валют (можно заменить на fetch API для автообновления)
let rates = { USD: 450, EUR: 485, RUB: 4.9, KZT: 1 };
let participants = { cafe: 0, rent: 0, travel: 0 };
let currentLang = 'ru';

function changeLang() {
    currentLang = document.getElementById('langSwitch').value;
    const l = langData[currentLang];
    document.getElementById('t-cafe').innerText = l.cafe;
    document.getElementById('t-rent').innerText = l.rent;
    document.getElementById('t-travel').innerText = l.travel;
    document.querySelectorAll('label[id^="l-"]').forEach(label => {
        const key = label.id.replace('l-', '');
        if (l[key]) label.innerText = l[key];
    });
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function addParticipant(containerId) {
    const section = containerId.includes('cafe') ? 'cafe' : containerId.includes('rent') ? 'rent' : 'travel';
    participants[section]++;
    const div = document.createElement('div');
    div.className = 'participant-row';
    div.innerHTML = `<input type="text" placeholder="Имя участника" style="margin-bottom:0; background:transparent; border:none; padding:5px;">`;
    document.getElementById(containerId).appendChild(div);
    calculateAll();
}

async function scanReceipt(input) {
    const file = input.files[0];
    if (!file) return;

    // Превью чека
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        document.getElementById('receiptPreview').appendChild(img);
    };
    reader.readAsDataURL(file);

    tg.MainButton.setText("Сканирую чек...").show();
    
    try {
        const result = await Tesseract.recognize(file, 'eng+rus');
        const numbers = result.data.text.match(/\d+[\.,]\d{2}/g); 
        if (numbers) {
            const maxNum = Math.max(...numbers.map(n => parseFloat(n.replace(',', '.'))));
            document.getElementById('totalAmount').value = maxNum;
            calculateAll();
        }
    } catch (e) { console.error(e); }
    tg.MainButton.hide();
}

function calculateAll() {
    const base = document.getElementById('baseCurrency').value;
    const sym = { KZT: '₸', USD: '$', EUR: '€', RUB: '₽' };

    // Расчет для Кафе
    let cSum = parseFloat(document.getElementById('totalAmount').value) || 0;
    const cCurr = document.getElementById('currencySelect').value;
    if (document.getElementById('serviceTax').checked) cSum *= 1.1;
    let cTotalInKzt = cSum * rates[cCurr];
    let cTotalBase = cTotalInKzt / rates[base];
    if (participants.cafe > 0) document.getElementById('valCafe').innerText = `${(cTotalBase/participants.cafe).toFixed(2)} ${sym[base]}`;

    // Расчет для Аренды
    let rSum = parseFloat(document.getElementById('rentAmount').value) || 0;
    let rTotalInKzt = rSum * rates[base]; // Тут считаем сразу в базе
    if (participants.rent > 0) document.getElementById('valRent').innerText = `${(rSum/participants.rent).toFixed(2)} ${sym[base]}`;
}

function resetApp() {
    if(confirm("Очистить всё? / Clear all?")) location.reload();
}

function share(type) {
    const val = (type === 'cafe') ? document.getElementById('valCafe').innerText : document.getElementById('valRent').innerText;
    const text = `💸 Расчет готов!\nНа каждого: ${val}\n\nПосчитано через @MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}

// Слушатели
document.getElementById('totalAmount').addEventListener('input', calculateAll);
document.getElementById('rentAmount').addEventListener('input', calculateAll);
