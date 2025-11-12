// 헌터.zip/헌터/game.js

// ===================================================================
// 0. Firebase 설정 및 초기화 (제거됨)
// ===================================================================

// ===================================================================
// 1. HTML 요소 및 기본 설정
// ===================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const finalScoreDisplay = document.getElementById('final-score');
const quizOverlay = document.getElementById('quiz-overlay');
const quizQuestionElement = document.getElementById('quiz-question');
const quizInput = document.getElementById('quiz-input');
const quizSubmitButton = document.getElementById('quiz-submit-button');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// 명예의 전당 및 공유 관련 요소
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');
const shareScoreButton = document.getElementById('share-score-button');
const highScoresList = document.getElementById('high-scores-list');
const resetScoresButton = document.getElementById('reset-scores-button'); // [추가] 초기화 버튼

const gridSize = 35; 
const tileCount = canvas.width / gridSize; 
 
// 게임 변수
let score = 0;
let snake = [{ x: 18, y: 18 }, { x: 17, y: 18 }, { x: 16, y: 18 }]; 
let direction = { x: 1, y: 0 }; 
let nextDirection = { x: 1, y: 0 }; 
let gameLoop;
let isGameActive = false;
let isPaused = false; 

// 퀴즈 및 콤보 변수 (생략)
const words = [
    { answer: "치즈", hint: "하얀 음식", initials: "ㅊㅈ" },
    // ... (모든 퀴즈 데이터 유지)
];
let currentQuizWord = '';
let quizTimer;
let comboCount = 0;
let comboMultiplier = 1; 
let comboTimeout;
const maxComboTime = 3000;

// 난이도 및 속도 변수 (생략)
const initialSpeed = 150; 
let currentSpeed = initialSpeed;
const speedIncreaseRate = 0.98;
let level = 1; 
let itemTimer = null; 

// 아이템 위치 객체 (생략)
let cheese = {};
let bomb = {};
let mushroom = {};
let clock = {};
let bigCheese = {}; 
let catWeapon = {}; 
let bullets = [];
let weaponInterval = null; 

// 시각적 피드백 (생략)
let comboMessage = ''; 
let comboMessageTimer = null; 
const comboMessageDuration = 1000; 

// [추가] 점수 팝업 피드백 변수
let scorePopups = [];

// 명예의 전당 로직
const MAX_HIGH_SCORES = 10; 

// ===================================================================
// 2. 초기화 및 유틸리티 함수
// ===================================================================

function initializeGame() {
    isGameActive = true;
    score = 0;
    currentSpeed = initialSpeed;
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    level = 1;
    resetCombo();
    
    messageDisplay.classList.add('hidden');
    quizOverlay.classList.add('hidden');
    
    // 명예의 전당 UI 초기화 및 숨김 설정
    playerNameInput.classList.add('hidden');
    saveScoreButton.classList.add('hidden');
    shareScoreButton.classList.add('hidden'); 
    
    scoreDisplay.textContent = score;

    snake = [{ x: 18, y: 18 }, { x: 17, y: 18 }, { x: 16, y: 18 }];

    generateItem('cheese');
    generateItem('bomb');
    generateItem('mushroom');
    generateItem('clock');
    generateItem('bigCheese'); 
    generateItem('catWeapon');

    if (weaponInterval) clearInterval(weaponInterval);
    bullets = [];
    
    loadHighScores(); // [추가] 게임 시작 시 점수판 로드

    startGameLoop(); 
}

function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, currentSpeed); 
}

function togglePause() {
    if (!isGameActive) return; 
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameLoop);
        drawGame(); 
    } else {
        startGameLoop();
    }
}

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * (canvas.height / gridSize)) 
    };
}

function isPositionOnSnake(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

function generateItem(type) {
    let pos;
    do {
        pos = getRandomPosition();
    } while (isPositionOnSnake(pos));

    if (type === 'bomb') {
        if (Math.random() < 0.5) { 
             return; 
        }
    }

    if (type === 'cheese') cheese = pos;
    else if (type === 'bomb') bomb = pos;
    else if (type === 'mushroom') mushroom = pos;
    else if (type === 'clock') clock = pos;
    else if (type === 'bigCheese') bigCheese = pos;
    else if (type === 'catWeapon') catWeapon = pos;
}

// ===================================================================
// 3. 핵심 게임 루프 (updateGame)
// ===================================================================

function updateGame() {
    if (!isGameActive || isPaused) return; 

    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (checkWallCollision(head) || checkSelfCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);
    let quizRequired = false;
    let ateItem = false;
    let itemPoints = 0; 
    let itemPos = { x: head.x, y: head.y };

    // 4. 아이템 획득 및 효과
    if (checkItemCollision(head, cheese)) {
        quizRequired = true; 
    } else if (checkItemCollision(head, bigCheese)) {
        itemPoints = 500;
        score += itemPoints;
        snake.unshift(head); snake.unshift(head); 
        ateItem = true;
        generateItem('bigCheese');
    } 
    else if (checkItemCollision(head, bomb)) {
        if (snake.length > 4) { snake.splice(snake.length - 3, 3); itemPoints = -3; } 
        else { gameOver(); return; }
        ateItem = true;
        generateItem('bomb');
    } else if (checkItemCollision(head, mushroom)) {
        applySpeedChange(0.5); 
        ateItem = true;
        itemPoints = "FAST!";
        generateItem('mushroom');
    } else if (checkItemCollision(head, clock)) {
        applySpeedChange(2.0); 
        ateItem = true;
        itemPoints = "SLOW!";
        generateItem('clock');
    }
    else if (checkItemCollision(head, catWeapon)) {
        if (snake.length > 3) snake.pop(); else { gameOver(); return; }
        applyWeaponDebuff();
        ateItem = true;
        generateItem('catWeapon');
    }

    // 4-1. 총알(디버프) 충돌 감지
    bullets.forEach(bullet => {
        if (checkItemCollision(head, bullet)) {
             if (snake.length > 2) { snake.pop(); } else { gameOver(); }
             bullets = bullets.filter(b => b !== bullet); 
        }
    });
    
    // [추가] 점수 팝업 생성 로직
    if (itemPoints !== 0) {
        let text = itemPoints;
        let color = '#fff';
        if (itemPoints === 500) color = '#ffd700'; 
        if (itemPoints === -3) text = "꼬리 -3"; 
        
        scorePopups.push({
            x: itemPos.x * gridSize + gridSize / 2,
            y: itemPos.y * gridSize + gridSize / 2,
            text: text.toString(),
            color: color,
            alpha: 1.0,
            timer: 0
        });
    }


    // 5. 꼬리 자르기 / 퀴즈 시작 결정
    if (quizRequired) {
        snake.pop(); 
        isGameActive = false;
        togglePause(); 
    } else if (!ateItem) {
        snake.pop(); 
    }
    
    // 치즈/폭탄 재생성 확률
    if (Object.keys(bomb).length === 0 && Math.random() < 0.3) generateItem('bomb');
    if (Object.keys(cheese).length === 0 && Math.random() < 0.5) generateItem('cheese');
    
    drawGame();
}

// 충돌 및 속도 함수 (생략)
function checkWallCollision(head) {
    const verticalTileCount = canvas.height / gridSize;
    return head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= verticalTileCount;
}

function checkSelfCollision(head) {
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
}

function checkItemCollision(head, item) {
    return head.x === item.x && head.y === item.y;
}

function applySpeedChange(multiplier) {
    if (itemTimer) clearTimeout(itemTimer);
    currentSpeed = initialSpeed * multiplier; 
    startGameLoop(); 
    itemTimer = setTimeout(() => {
        currentSpeed = initialSpeed; 
        startGameLoop(); 
    }, 5000); 
}

function applyWeaponDebuff() {
    if (weaponInterval) clearInterval(weaponInterval);
    
    weaponInterval = setInterval(() => {
        let bulletPos = getRandomPosition();
        bullets.push(bulletPos); 
        setTimeout(() => {
            bullets = bullets.filter(b => b !== bulletPos);
        }, 1000); 
    }, 500); 

    setTimeout(() => {
        clearInterval(weaponInterval);
        weaponInterval = null;
        bullets = []; 
    }, 5000);
}

// ===================================================================
// 4. 퀴즈 및 콤보 시스템 (생략)
// ===================================================================

function startQuiz() {
    const quizData = words[Math.floor(Math.random() * words.length)];
    currentQuizWord = quizData.answer;
    let timeLeft = 10;
    
    quizQuestionElement.textContent = `문제: ${quizData.hint} / 초성: ${quizData.initials} (${timeLeft}초)`;
    quizInput.value = '';
    quizOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        quizInput.focus();
    }, 10); 

    quizTimer = setInterval(() => {
        timeLeft--;
        quizQuestionElement.textContent = `문제: ${quizData.hint} / 초성: ${quizData.initials} (${timeLeft}초)`;
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            handleQuizResult(false); 
        }
    }, 1000);
}

function handleQuizResult(isCorrect) {
    clearInterval(quizTimer);
    quizOverlay.classList.add('hidden');
    isGameActive = true;
    
    if (comboTimeout) clearTimeout(comboTimeout);
    if (comboMessageTimer) clearTimeout(comboMessageTimer);
    comboTimeout = setTimeout(resetCombo, maxComboTime); 

    let popUpText = "오답!";
    let popUpColor = '#e74c3c';

    if (isCorrect) {
        comboCount++; 
        comboMultiplier = 1 + Math.floor(comboCount / 3) * 0.5; 
        let points = 100 * comboMultiplier;
        score += points; 
        
        level++;
        const newSpeed = initialSpeed * Math.pow(speedIncreaseRate, level); 
        currentSpeed = Math.max(newSpeed, 50); 

        if (comboCount > 1) {
            comboMessage = `${comboCount} 콤보! (X ${comboMultiplier.toFixed(1)})`;
        } else {
            comboMessage = ''; 
        }
        
        snake.unshift({ x: snake[0].x, y: snake[0].y }); 
        
        popUpText = `+${points.toFixed(0)}`;
        popUpColor = '#2ecc71';

    } else {
        resetCombo();
        comboMessage = 'COMBO BREAK!';
        if (snake.length > 3) { snake.pop(); }
    }
    
    // 퀴즈 결과 팝업 생성
    scorePopups.push({
        x: snake[0].x * gridSize + gridSize / 2,
        y: snake[0].y * gridSize + gridSize / 2,
        text: popUpText,
        color: popUpColor,
        alpha: 1.0,
        timer: 0
    });
    
    comboMessageTimer = setTimeout(() => {
        comboMessage = '';
        drawGame();
    }, comboMessageDuration);
    
    generateItem('cheese');
    togglePause(); 
}

function resetCombo() {
    comboCount = 0;
    comboMultiplier = 1;
    if (comboTimeout) clearTimeout(comboTimeout);
}

// ===================================================================
// 5. 그리기 함수 (drawGame) (생략)
// ===================================================================

function drawGame() {
    // 캔버스 초기화
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2c3e50' : '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 뱀 그리기
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#16a085' : '#1abc9c';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#2c3e50';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 아이템 그리기
    drawItem(cheese, '#f1c40f', '🧀');
    drawItem(bomb, '#c0392b', '💣');
    drawItem(mushroom, '#8e44ad', '🍄');
    drawItem(clock, '#3498db', '⏳');
    drawItem(bigCheese, '#ffd700', '🥇');
    drawItem(catWeapon, '#e74c3c', '🔫');

    // 총알 그리기
    bullets.forEach(bullet => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(bullet.x * gridSize + 5, bullet.y * gridSize + 5, gridSize - 10, gridSize - 10);
    });

    // 콤보 메시지 그리기
    if (comboMessage) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px Arial';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 5;
        ctx.fillStyle = comboMessage.includes('BREAK') ? '#e74c3c' : '#f1c40f';
        ctx.fillText(comboMessage, canvas.width / 2, 50);
        ctx.shadowBlur = 0;
    }
    
    // [추가] 점수 팝업 그리기 및 업데이트
    scorePopups = scorePopups.filter(popup => popup.alpha > 0);
    scorePopups.forEach(popup => {
        ctx.globalAlpha = popup.alpha;
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = popup.color;
        
        ctx.fillText(popup.text, popup.x, popup.y);

        // 팝업 이동 및 투명도 감소
        popup.y -= 1; 
        popup.alpha -= 0.03; 
        popup.timer++;
    });
    ctx.globalAlpha = 1.0; 

    // [추가] 일시정지 메시지 그리기
    if (isPaused && isGameActive && quizOverlay.classList.contains('hidden')) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 40px Arial';
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    }
    
    // 레벨/배율 정보 그리기
    ctx.textAlign = 'left';
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Level: ${level}`, 10, 15);

    if (comboMultiplier > 1) {
        ctx.fillStyle = '#f1c40f'; 
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`x ${comboMultiplier.toFixed(1)}`, canvas.width - 10, 15);
    }

    scoreDisplay.textContent = score;
}

function drawItem(item, color, symbol) {
    ctx.fillStyle = color;
    ctx.fillRect(item.x * gridSize, item.y * gridSize, gridSize, gridSize);
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, item.x * gridSize + gridSize / 2, item.y * gridSize + gridSize / 2 + 1);
}

// ===================================================================
// 6. 이벤트 및 게임 종료
// ===================================================================

function gameOver() {
    isGameActive = false;
    clearInterval(gameLoop);
    if (itemTimer) clearTimeout(itemTimer);
    if (weaponInterval) clearInterval(weaponInterval);
    
    finalScoreDisplay.textContent = `최종 점수: ${score}점`;
    messageDisplay.classList.remove('hidden'); 
    
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    shareScoreButton.classList.remove('hidden');
    playerNameInput.focus();
}

// [로컬 스토리지] 명예의 전당 로드 (Firebase 로직 대체)
function loadHighScores() {
    // highScoresList가 존재하지 않으면 로드 시도하지 않음
    if (!highScoresList) return; 
    
    // 로컬 스토리지에서 점수 로드
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.sort((a, b) => b.score - a.score);
    
    // UI 업데이트
    highScoresList.innerHTML = scores.slice(0, MAX_HIGH_SCORES).map((item, index) => {
        const displayScore = item.score !== undefined ? item.score : 0;
        const displayName = item.name || "UNNAMED";
        return `<li>${index + 1}. ${displayName} - ${displayScore}점</li>`;
    }).join('');

    if (scores.length === 0) {
        highScoresList.innerHTML = `<li>아직 등록된 점수가 없습니다.</li>`;
    }
}

// [로컬 스토리지] 명예의 전당 점수를 저장 (Firebase 로직 대체)
function saveHighScore() {
    if (saveScoreButton.disabled) return;
    
    let name = playerNameInput.value.trim().toUpperCase();
    
    name = name.substring(0, 3);
    name = name.replace(/[^A-Z0-9ㄱ-ㅎ가-힣]/g, ''); 
    
    if (name.length === 0) {
        name = "GUEST";
    }

    const newScore = { 
        score: score, 
        name: name
    };
    
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = '등록 중...';

    // 로컬 스토리지에 저장
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    
    localStorage.setItem('highScores', JSON.stringify(scores.slice(0, MAX_HIGH_SCORES)));

    alert(`${name}님의 ${score}점이 명예의 전당에 등록되었습니다!`);
    
    loadHighScores();
    playerNameInput.classList.add('hidden');
    saveScoreButton.classList.add('hidden');
}

// 명예의 전당 초기화 기능
function resetHighScores() {
    if (confirm("정말 명예의 전당 점수를 모두 초기화하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) {
        localStorage.removeItem('highScores');
        loadHighScores();
        alert("점수가 초기화되었습니다!");
    }
}
// [추가] 로컬 스토리지 초기화 버튼 이벤트 리스너
if (resetScoresButton) {
    resetScoresButton.addEventListener('click', resetHighScores);
}


// [추가] 점수 등록 버튼 이벤트 리스너
saveScoreButton.addEventListener('click', saveHighScore);
shareScoreButton.addEventListener('click', shareScore);


// 키보드 입력 처리 (방향키, Enter, 일시정지 포함)
document.addEventListener('keydown', (e) => {
    let newDirection = { x: direction.x, y: direction.y };
    let handled = false; 

    // 일시정지 기능 (Spacebar 또는 P)
    if ((e.key === ' ' || e.key.toLowerCase() === 'p') && isGameActive && quizOverlay.classList.contains('hidden')) {
        togglePause();
        handled = true;
    }

    if ((e.key === 'ArrowUp' || e.key === 'w') && direction.y === 0) {
        newDirection = { x: 0, y: -1 };
        handled = true;
    } else if ((e.key === 'ArrowDown' || e.key === 's') && direction.y === 0) {
        newDirection = { x: 0, y: 1 };
        handled = true;
    } else if ((e.key === 'ArrowLeft' || e.key === 'a') && direction.x === 0) {
        newDirection = { x: -1, y: 0 };
        handled = true;
    } else if ((e.key === 'ArrowRight' || e.key === 'd') && direction.x === 0) {
        newDirection = { x: 1, y: 0 };
        handled = true;
    } 
    // Enter 키로 게임 재시작 기능 (점수 등록 UI가 보이지 않을 때만)
    else if (e.key === 'Enter' && messageDisplay.classList.contains('hidden') === false && playerNameInput.classList.contains('hidden')) {
        initializeGame();
        handled = true;
    }
    
    // 방향키와 WASD 키에 대해 브라우저의 기본 동작(스크롤)을 막습니다.
    if (handled || e.key.startsWith('Arrow')) {
        e.preventDefault(); 
    }

    // 일시정지 상태가 아닐 때만 방향 변경 적용
    if (!isPaused) {
        nextDirection = newDirection;
    }
});

// 퀴즈 제출 이벤트 리스너 (Enter 시 제출)
quizSubmitButton.addEventListener('click', () => {
    if (quizInput.value.toLowerCase() === currentQuizWord.toLowerCase()) {
        handleQuizResult(true);
    } else {
        handleQuizResult(false);
    }
});

quizInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        quizSubmitButton.click();
    }
});

playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        saveScoreButton.click();
    }
});

// 다크 모드 토글
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); 
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ 라이트 모드' : '🌙 다크 모드';
});

// 게임 시작
initializeGame();
