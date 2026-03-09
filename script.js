function createMessage(text, sender, messageList) {
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    message.textContent = text;
    messageList.appendChild(message);
    messageList.scrollTop = messageList.scrollHeight;
}

function detectReply(messageText) {
    const lowerText = messageText.toLowerCase();

    const keywordReplies = {
        'привет': [
            'Привет! Рад знакомству 👋',
            'Здравствуйте! Спасибо, что написали.'
        ],
        'вшэ': [
            'ВШЭ дает очень сильную базу и много практики.',
            'Мне нравится, что в ВШЭ много проектной работы.'
        ],
        'миэм': [
            'МИЭМ — отличное место для тех, кто любит математику и технологии.',
            'В МИЭМ крутые лаборатории и сильные преподаватели.'
        ],
        'диплом': [
            'Сейчас активно готовлюсь к защите диплома.',
            'Тема диплома связана с машинным обучением.'
        ],
        'проект': [
            'Сейчас веду несколько учебных проектов по анализу данных.',
            'Проекты помогают прокачивать навыки быстрее теории.'
        ]
    };

    for (const keyword in keywordReplies) {
        if (lowerText.includes(keyword)) {
            const answers = keywordReplies[keyword];
            return answers[Math.floor(Math.random() * answers.length)];
        }
    }

    const fallbackReplies = [
        'Интересный вопрос! Расскажите подробнее 🙂',
        'Спасибо за сообщение! Я обязательно отвечу позже.',
        'Принял! Можем обсудить это подробнее в чате.'
    ];

    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

window.onload = function () {
    const mapContainer = document.getElementById('map');
    if (mapContainer && typeof L !== 'undefined') {
        const map = L.map('map').setView([55.8035, 37.3951], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([55.8035, 37.3951])
            .addTo(map)
            .bindPopup('МИЭМ ВШЭ, Таллинская улица, 34')
            .openPopup();
    }

    const messageList = document.getElementById('chat-messages');
    const messageInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const voiceButton = document.getElementById('voice-message');

    if (!messageList || !messageInput || !sendButton || !voiceButton) {
        return;
    }

    function sendTextMessage() {
        const text = messageInput.value.trim();
        if (!text) {
            return;
        }

        createMessage(text, 'user', messageList);
        messageInput.value = '';

        const reply = detectReply(text);
        setTimeout(() => {
            createMessage(reply, 'bot', messageList);
        }, 500);
    }

    sendButton.addEventListener('click', sendTextMessage);

    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendTextMessage();
        }
    });

    let mediaRecorder = null;
    let chunks = [];
    let isRecording = false;

    voiceButton.addEventListener('click', async function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            createMessage('Голосовые сообщения не поддерживаются в этом браузере.', 'bot', messageList);
            return;
        }

        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                chunks = [];

                mediaRecorder.ondataavailable = function (event) {
                    chunks.push(event.data);
                };

                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    const voiceMessage = document.createElement('div');
                    voiceMessage.className = 'chat-message user';
                    voiceMessage.innerHTML = '<span>🎤 Голосовое сообщение:</span>';

                    const audio = document.createElement('audio');
                    audio.controls = true;
                    audio.src = audioUrl;
                    voiceMessage.appendChild(audio);

                    messageList.appendChild(voiceMessage);
                    messageList.scrollTop = messageList.scrollHeight;

                    setTimeout(() => {
                        createMessage('Прослушал голосовое сообщение. Спасибо! 🎧', 'bot', messageList);
                    }, 700);

                    stream.getTracks().forEach((track) => track.stop());
                };

                mediaRecorder.start();
                isRecording = true;
                voiceButton.textContent = '⏹ Остановить запись';
            } catch (error) {
                createMessage('Не удалось получить доступ к микрофону.', 'bot', messageList);
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            voiceButton.textContent = '🎤 Голосовое сообщение';
        }
    });
};
