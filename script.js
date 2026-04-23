const tg = window.Telegram.WebApp;
tg.expand();

let rates = { USD: 450, EUR: 480, RUB: 5, KZT: 1 };
let participants = { cafe: 0, rent: 0, travel: 0 };

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function addParticipant(containerId) {
    const section = containerId.replace('List', '').replace('Participants', '');
    participants[section === 'participants' ? 'cafe' : section]++;
    
    const div = document.createElement('div');
    div.innerHTML = `<input type="text" placeholder="Имя участника" class="p-name">`;
    document.getElementById(containerId).appendChild(div);
    calculateAll();
}

function addExpense() {
    const div = document.createElement('div');
    div.className = 'settings-grid';
    div.innerHTML = `
        <input type="number" class="exp-val" placeholder="Сумма" oninput="calculateAll()">
        <select class="exp-cur" onchange="calculateAll()"><option value="KZT">₸</option><option value="USD">$</option></select>
    `;
    document.getElementById('travelExpenses').appendChild(div);
}

function calculateAll() {
    // Кафе
    let cSum = parseFloat(document.getElementById('totalAmount').value) || 0;
    if (document.getElementById('serviceTax').checked) cSum *= 1.1;
    if (participants.cafe > 0) document.getElementById('valCafe').innerText = Math.round(cSum / participants.cafe) + " ₸";

    // Аренда
    let rSum = parseFloat(document.getElementById('rentAmount').value) || 0;
    if (participants.rent > 0) document.getElementById('valRent').innerText = Math.round(rSum / participants.rent) + " ₸";

    // Тревел
    let tSum = 0;
    document.querySelectorAll('.exp-val').forEach((el, i) => {
        let val = parseFloat(el.value) || 0;
        let cur = document.querySelectorAll('.exp-cur')[i].value;
        tSum += cur === 'KZT' ? val : val * rates[cur];
    });
    if (participants.travel > 0) document.getElementById('valTravel').innerText = Math.round(tSum / participants.travel) + " ₸";
}

document.getElementById('totalAmount').addEventListener('input', calculateAll);
document.getElementById('rentAmount').addEventListener('input', calculateAll);
document.getElementById('serviceTax').addEventListener('change', calculateAll);

function share(type) {
    let val = document.getElementById('val' + type.charAt(0).toUpperCase() + type.slice(1)).innerText;
    let text = `💸 Счет разделен (${type})!\nНа каждого: ${val}\n\nПосчитано в @MyCoolSplitBot`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(text)}`);
}
