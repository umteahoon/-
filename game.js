// 헌터.zip/헌터/game.js (최종 안정화 코드)

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

// 명예의 전당 관련 요소
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');
const scoreList = document.getElementById('score-list');
const resetScoresButton = document.getElementById('reset-scores-button'); 

const gridSize = 35; 
const tileCount = canvas.width / gridSize; 
 
// 게임 변수
let score = 0;
// 뱀 초기 위치를 유효 범위 내 (Y=7)로 수정
let snake = [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }]; 
let direction = { x: 1, y: 0 }; 
let nextDirection = { x: 1, y: 0 }; 
let gameLoop;
let isGameActive = false;
let isPaused = false; // 일시정지 상태

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

// 난이도 및 속도 변수
const initialSpeed = 150; 
let currentSpeed = initialSpeed;
const speedIncreaseRate = 0.98;
let level = 1; 
let itemTimer = null; 

// 아이템 위치 객체
let cheese = {};
let bomb = {};
let mushroom = {};
let clock = {};
let bigCheese = {}; 
// catWeapon 관련 변수 제거

// 시각적 피드백
let comboMessage = ''; 
let comboMessageTimer = null; 
const comboMessageDuration = 1000; 

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
    
    scoreDisplay.textContent = score;

    // 뱀 초기 위치 (Y=7)
    snake = [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }];

    generateItem('cheese');
    generateItem('bomb');
    generateItem('mushroom');
    generateItem('clock');
    generateItem('bigCheese'); 
    
    // catWeapon 관련 로직 제거

    loadHighScores(); 

    startGameLoop(); 
}

function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, currentSpeed); 
}

// [추가] 일시정지/재개 토글 함수
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
}

// ===================================================================
// 3. 핵심 게임 루프 (updateGame)
// ===================================================================

function updateGame() {
    if (!isGameActive || isPaused) return; // [체크] 일시정지 상태 체크

    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (checkWallCollision(head) || checkSelfCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);
    let quizRequired = false;
    let ateItem = false;

    // 4. 아이템 획득 및 효과
    if (checkItemCollision(head, cheese)) {
        quizRequired = true; 
    } else if (checkItemCollision(head, bigCheese)) {
        score += 500;
        snake.unshift(head); snake.unshift(head); 
        ateItem = true;
        generateItem('bigCheese');
    } 
    else if (checkItemCollision(head, bomb)) {
        if (snake.length > 4) { snake.splice(snake.length - 3, 3); } 
        else { gameOver(); return; }
        ateItem = true;
        generateItem('bomb');
    } else if (checkItemCollision(head, mushroom)) {
        applySpeedChange(0.5); 
        ateItem = true;
        generateItem('mushroom');
    } else if (checkItemCollision(head, clock)) {
        applySpeedChange(2.0); 
        ateItem = true;
        generateItem('clock');
    }
    // catWeapon 로직 제거

    // 총알 충돌 감지 로직 제거
    
    // 5. 꼬리 자르기 / 퀴즈 시작 결정
    if (quizRequired) {
        snake.pop(); 
        isGameActive = false;
        isPaused = true; // [수정] 퀴즈 시작 시 뱀의 움직임만 멈춤
        startQuiz();
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
    return head.x === item.x && item.y === item.y;
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

// applyWeaponDebuff 함수 제거

// ===================================================================
// 4. 퀴즈 및 콤보 시스템
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
    
    isPaused = false; // [수정] 퀴즈가 끝나면 일시정지 상태를 해제합니다.
    
    if (comboTimeout) clearTimeout(comboTimeout);
    if (comboMessageTimer) clearTimeout(comboMessageTimer);
    comboTimeout = setTimeout(resetCombo, maxComboTime); 

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
        
    } else {
        resetCombo();
        comboMessage = 'COMBO BREAK!';
        if (snake.length > 3) { snake.pop(); }
    }
    
    // 메시지 타이머 설정
    comboMessageTimer = setTimeout(() => {
        comboMessage = '';
        drawGame();
    }, comboMessageDuration);
    
    generateItem('cheese');
    startGameLoop(); 
}

function resetCombo() {
    comboCount = 0;
    comboMultiplier = 1;
    if (comboTimeout) clearTimeout(comboTimeout);
}

// ===================================================================
// 5. 그리기 함수 (drawGame)
// ===================================================================

function drawGame() {
    // 캔버스 초기화
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#2c3e50' : '#ecf0f1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 뱀 그리기: 사각형 기반
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

    // [제거] 총알 그리기 로직 제거
    
    // [제거] 콤보 메시지 그리기 로직 제거 (콤보 메시지 변수 사용 안함)

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
    
    finalScoreDisplay.textContent = `최종 점수: ${score}점`;
    messageDisplay.classList.remove('hidden'); 
    
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    
    playerNameInput.focus();
}

// [로컬 스토리지] 명예의 전당 로드
function loadHighScores() {
    if (!scoreList) return; 
    
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.sort((a, b) => b.score - a.score);
    
    scoreList.innerHTML = scores.slice(0, MAX_HIGH_SCORES).map((item, index) => {
        const displayScore = item.score !== undefined ? item.score : 0;
        const displayName = item.name || "UNNAMED";
        return `<li>${index + 1}. ${displayName} - ${displayScore}점</li>`;
    }).join('');

    if (scores.length === 0) {
        scoreList.innerHTML = `<li>아직 등록된 점수가 없습니다.</li>`;
    }
}

// [로컬 스토리지] 명예의 전당 점수를 저장
function saveHighScore() {
    if (saveScoreButton.disabled) return;
    
    let name = playerNameInput.value.trim().toUpperCase();
    
    name = name.substring(0, 3);
    name = name.replace(/[^A-Z0-9ㄱ-ㅎ가-힣]/g, ''); 
    
    if (name.length === 0) {
        name = "GUEST";
    }

    const newScore = { score: score, name: name };
    
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = '등록 중...';

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
if (resetScoresButton) {
    resetScoresButton.addEventListener('click', resetHighScores);
}


// [추가] 점수 등록 버튼 이벤트 리스너
saveScoreButton.addEventListener('click', saveHighScore);


// 키보드 입력 처리 (방향키, Enter, 일시정지 포함)
document.addEventListener('keydown', (e) => {
    let newDirection = { x: direction.x, y: direction.y };
    let handled = false; 

    // [수정] 일시정지 기능 (Spacebar 또는 P)
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
