function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

let travelExpenses = [];

document.getElementById('addExpenseBtn').addEventListener('click', () => {
    const expenseId = Date.now();
    const div = document.createElement('div');
    div.className = 'expense-item';
    div.innerHTML = `
        <input type="text" placeholder="За что (Аренда, ужин...)" style="font-size:14px; margin-bottom:5px;">
        <div style="display:flex; gap:10px;">
            <input type="number" class="exp-amt" data-id="${expenseId}" placeholder="Сумма" style="font-size:18px;">
            <select class="exp-curr" data-id="${expenseId}">
                <option value="KZT">₸</option>
                <option value="USD">$</option>
                <option value="EUR">€</option>
            </select>
        </div>
    `;
    document.getElementById('expensesList').appendChild(div);
    
    div.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', calculateTravel);
    });
});

function calculateTravel() {
    let totalKZT = 0;
    const amts = document.querySelectorAll('.exp-amt');
    const currs = document.querySelectorAll('.exp-curr');
    
    amts.forEach((amt, i) => {
        const val = parseFloat(amt.value) || 0;
        const curr = currs[i].value;
        const rate = curr === 'KZT' ? 1 : 1 / rates[curr]; // Берем из нашего API курсов
        totalKZT += val / rate;
    });

    if (totalKZT > 0 && count > 0) {
        document.getElementById('travelPerPerson').innerText = Math.round(totalKZT / count) + " ₸";
        document.getElementById('travelResult').style.display = 'block';
    }
}
