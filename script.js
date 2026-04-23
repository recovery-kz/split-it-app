const tg = window.Telegram.WebApp;
tg.expand(); // Расширяем на все окно

const totalInput = document.getElementById('totalAmount');
const participantsList = document.getElementById('participantsList');
const addPersonBtn = document.getElementById('addPersonBtn');
const resultArea = document.getElementById('resultArea');
const perPersonDisplay = document.getElementById('perPersonAmount');

let participantsCount = 0;

function calculate() {
    const total = parseFloat(totalInput.value) || 0;
    if (total > 0 && participantsCount > 0) {
        const perPerson = (total / participantsCount).toFixed(2);
        perPersonDisplay.innerText = perPerson;
        resultArea.style.display = 'block';
    } else {
        resultArea.style.display = 'none';
    }
}

addPersonBtn.addEventListener('click', () => {
    participantsCount++;
    const div = document.createElement('div');
    div.className = 'participant-item';
    div.innerHTML = `<input type="text" placeholder="Имя (необязательно)" style="font-size: 16px;">`;
    participantsList.appendChild(div);
    calculate();
});

totalInput.addEventListener('input', calculate);

document.getElementById('shareBtn').addEventListener('click', () => {
    const total = totalInput.value;
    const perPerson = perPersonDisplay.innerText;
    const text = `Счет разделен! Итого: ${total}\nНа каждого по: ${perPerson}`;
    
    // В реальном приложении здесь будет вызов отправки сообщения через бота
    tg.sendData(text); 
});