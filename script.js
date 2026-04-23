const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const totalInput = document.getElementById('totalAmount');
const participantsList = document.getElementById('participantsList');
const addPersonBtn = document.getElementById('addPersonBtn');
const resultArea = document.getElementById('resultArea');
const perPersonDisplay = document.getElementById('perPersonAmount');

let count = 0;

function update() {
    const total = parseFloat(totalInput.value) || 0;
    if (total > 0 && count > 0) {
        // Форматируем число для красоты
        const perPerson = (total / count).toFixed(2);
        perPersonDisplay.innerText = perPerson + " ₸";
        resultArea.style.display = 'block';
    } else {
        resultArea.style.display = 'none';
    }
}

addPersonBtn.addEventListener('click', () => {
    count++;
    const item = document.createElement('div');
    item.className = 'participant-item';
    item.innerHTML = `<input type="text" placeholder="Имя участника" style="font-size: 16px; border-bottom: 1px solid #eee; margin-bottom: 10px; width: 100%;">`;
    participantsList.appendChild(item);
    update();
});

totalInput.addEventListener('input', update);

document.getElementById('shareBtn').addEventListener('click', () => {
    const total = totalInput.value;
    const perPerson = perPersonDisplay.innerText;
    
    // Формируем текст сообщения
    const message = `💸 Счет разделен!\n\n💰 Общая сумма: ${total} ₸\n👥 Участников: ${count}\n👉 На каждого: ${perPerson}\n\nПосчитано через @MyCoolSplitBot`;
    
    // Кодируем текст для URL
    const encodedText = encodeURIComponent(message);
    
    // Используем нативный метод пересылки Telegram
    // Это откроет список чатов, чтобы пользователь выбрал, куда отправить результат
    const shareUrl = `https://t.me/share/url?url=${encodedText}`;
    
    tg.openTelegramLink(shareUrl);
});
