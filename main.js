// --- 1. AYARLAR VE DEĞİŞKENLER ---
let options = ["Pizza 🍕", "Sinema 🍿", "Kod Yazmak 💻", "Uyumak 😴", "Yürüyüş 🏃"];
let currentRotation = 0;
const storageKey = 'decidefy_history';

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin-btn');
const input = document.getElementById('option-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('option-list');

// --- 2. SES MOTORU (Kesin Çözüm) ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTick() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playWinnerSound() {
    if (!audioCtx) return;
    [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(f, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.4);
    });
}

// --- 3. GÖRSEL EFEKTLER (Balonlar) ---
function createBalloons() {
    const container = document.getElementById('balloon-container');
    if (!container) return;
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#4ade80'];
    for(let i = 0; i < 15; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        const size = Math.random() * 50 + 30;
        balloon.style.left = Math.random() * 100 + 'vw';
        balloon.style.width = size + 'px';
        balloon.style.height = (size * 1.2) + 'px';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.borderRadius = '50%';
        balloon.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(balloon);
    }
}

// --- 4. ÇARK MANTIĞI ---
function drawWheel() {
    const len = options.length;
    const sliceAngle = (2 * Math.PI) / len;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    options.forEach((opt, i) => {
        const angle = i * sliceAngle;
        ctx.beginPath();
        ctx.fillStyle = `hsl(${i * (360 / len)}, 70%, 55%)`;
        ctx.moveTo(225, 225);
        ctx.arc(225, 225, 220, angle, angle + sliceAngle);
        ctx.lineTo(225, 225);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();

        ctx.save();
        ctx.translate(225, 225);
        ctx.rotate(angle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(opt.substring(0, 15), 200, 10);
        ctx.restore();
    });
}

// --- 5. ETKİLEŞİM VE OYNANIŞ ---
spinBtn.onclick = () => {
    if (options.length < 2) return alert("En az 2 seçenek eklemelisin!");
    
    initAudio(); // Ses motorunu burada uyandırıyoruz

    const extraSpin = Math.floor(Math.random() * 360) + 1800; // Min 5 tur
    currentRotation += extraSpin;
    
    canvas.style.transform = `rotate(${currentRotation}deg)`;
    spinBtn.disabled = true;

    // Tık tık seslerini simüle et
    for (let i = 0; i < 30; i++) {
        const delay = Math.pow(i / 29, 2.5) * 5000;
        setTimeout(() => playTick(), delay);
    }

    setTimeout(() => {
        spinBtn.disabled = false;
        playWinnerSound();
        
        // Kazananı Hesapla
        const actualDeg = currentRotation % 360;
        const sliceSize = 360 / options.length;
        const winningIndex = Math.floor(((360 - actualDeg + 270) % 360) / sliceSize);
        
        showWinner(options[winningIndex]);
    }, 5000);
};

function showWinner(text) {
    document.getElementById('winner-text').innerText = text;
    document.getElementById('winner-modal').style.display = 'flex';
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

window.closeModal = () => {
    document.getElementById('winner-modal').style.display = 'none';
};

// --- 6. LİSTE YÖNETİMİ ---
addBtn.onclick = () => {
    if (input.value.trim()) {
        options.push(input.value);
        input.value = '';
        updateUI();
    }
};

function updateUI() {
    list.innerHTML = options.map((opt, i) => `
        <span class="bg-white/10 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-white/10 text-white">
            ${opt} 
            <button onclick="removeOption(${i})" class="text-pink-400 hover:text-white">×</button>
        </span>
    `).join('');
    drawWheel();
}

window.removeOption = (i) => {
    options.splice(i, 1);
    updateUI();
};

// Başlat
createBalloons();
updateUI();