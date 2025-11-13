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

const gridSize = 35; 
// 캔버스 너비 875 / 35 = 25 (가로 타일 수)
const tileCount = canvas.width / gridSize; 
 
// 게임 변수
let score = 0;
// 뱀 시작 위치를 새로운 캔버스 중앙 근처 (12, 7)로 조정 (25x15 타일)
let snake = [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }]; 
let direction = { x: 1, y: 0 }; 
let nextDirection = { x: 1, y: 0 }; 
let gameLoop;
let isGameActive = false;

// 퀴즈 및 콤보 변수
const words = [
    { answer: "치즈", hint: "하얀 음식", initials: "ㅊㅈ" },
    { answer: "사과", hint: "달콤한 과일", initials: "ㅅㄱ" },
    { answer: "전등", hint: "밤에 켜는 불", initials: "ㅈㄷ" },
    { answer: "구름", hint: "하늘에 뭉게뭉게", initials: "ㄱㄹ" },
    { answer: "책상", hint: "공부할 때 쓰는 가구", initials: "ㅊㅅ" },
    { answer: "의자", hint: "앉을 때 필요해요", initials: "ㅇㅈ" },
    { answer: "연필", hint: "글씨를 쓰는 도구", initials: "ㅇㅍ" },
    { answer: "지우개", hint: "연필 자국을 없애요", initials: "ㅈㅇㄱ" },
    { answer: "컴퓨터", hint: "정보를 처리하는 기계", initials: "ㅋㅍㅌ" },
    { answer: "시계", hint: "시간을 알려줘요", initials: "ㅅㄱ" },
    { answer: "가방", hint: "물건을 넣어 다녀요", initials: "ㄱㅂ" },
    { answer: "신발", hint: "발에 신는 것", initials: "ㅅㅂ" },
    { answer: "양말", hint: "신발 속에 신어요", initials: "ㅇㅁ" },
    { answer: "우산", hint: "비 올 때 쓰는 도구", initials: "ㅇㅅ" },
    { answer: "텔레비전", hint: "영상을 보여주는 가전제품", initials: "ㅌㄹㅂㅈ" },
    { answer: "냉장고", hint: "음식을 차갑게 보관", initials: "ㄴㅈㄱ" },
    { answer: "세탁기", hint: "옷을 깨끗하게 해줘요", initials: "ㅅㅌㄱ" },
    { answer: "휴대폰", hint: "손에 들고 통화하는 기기", initials: "ㅎㄷㅍ" },
    { answer: "수건", hint: "물기를 닦아요", initials: "ㅅㄱ" },
    { answer: "거울", hint: "내 모습을 비춰줘요", initials: "ㄱㅇ" },
    { answer: "바람", hint: "눈에 보이지 않는 공기의 흐름", initials: "ㅂㄹ" },
    { answer: "햇빛", hint: "해에서 나오는 빛", initials: "ㅎㅃ" },
    { answer: "자동차", hint: "바퀴로 굴러가는 교통수단", initials: "ㅈㄷㅊ" },
    { answer: "비행기", hint: "하늘을 날아요", initials: "ㅂㅎㄱ" },
    { answer: "기차", hint: "긴 줄로 연결된 교통수단", initials: "ㄱㅊ" },
    { answer: "버스", hint: "많은 사람이 함께 타요", initials: "ㅂㅅ" },
    { answer: "경찰", hint: "범인을 잡고 치안을 유지", initials: "ㄱㅊ" },
    { answer: "소방관", hint: "불을 끄는 사람", initials: "ㅅㅂㄱ" },
    { answer: "병원", hint: "아플 때 가는 곳", initials: "ㅂㅇ" },
    { answer: "학교", hint: "공부를 배우는 곳", initials: "ㅎㄱ" },
    { answer: "은행", hint: "돈을 맡기는 곳", initials: "ㅇㅎ" },
    { answer: "시장", hint: "물건을 사고파는 곳", initials: "ㅅㅈ" },
    { answer: "공원", hint: "나무가 많고 쉴 수 있는 곳", initials: "ㄱㅇ" },
    { answer: "산책", hint: "천천히 걷는 행위", initials: "ㅅㅊ" },
    { answer: "요리", hint: "음식을 만드는 행위", initials: "ㅇㄹ" },
    { answer: "청소", hint: "더러운 것을 치우는 일", initials: "ㅊㅅ" },
    { answer: "세수", hint: "손으로 얼굴을 씻어요", initials: "ㅅㅅ" },
    { answer: "양치", hint: "이빨을 닦아요", initials: "ㅇㅊ" },
    { answer: "잠옷", hint: "잘 때 입는 옷", initials: "ㅈㅇ" },
    { answer: "이불", hint: "잘 때 덮는 것", initials: "ㅇㅂ" },
    { answer: "베개", hint: "머리를 받치고 자요", initials: "ㅂㄱ" },
    { answer: "화장실", hint: "용변을 보는 곳", initials: "ㅎㅈㅅ" },
    { answer: "비누", hint: "손을 닦을 때 거품이 나요", initials: "ㅂㄴ" },
    { answer: "샴푸", hint: "머리를 감을 때 사용", initials: "ㅅㅍ" },
    { answer: "칫솔", hint: "양치할 때 쓰는 도구", initials: "ㅊㅅ" },
    { answer: "거품", hint: "비누가 물에 녹아 생겨요", initials: "ㄱㅍ" },
    { answer: "꽃병", hint: "꽃을 꽂아 두는 통", initials: "ㄲㅂ" },
    { answer: "사진", hint: "카메라로 순간을 담아요", initials: "ㅅㅈ" },
    { answer: "편지", hint: "글로 마음을 전달해요", initials: "ㅍㅈ" },
    { answer: "선물", hint: "기념일에 주고받는 것", initials: "ㅅㅁ" },
    { answer: "생일", hint: "태어난 날", initials: "ㅅㅇ" },
    { answer: "겨울", hint: "눈이 오고 추운 계절", initials: "ㄱㅇ" },
    { answer: "여름", hint: "덥고 해가 긴 계절", initials: "ㅇㄹ" },
    { answer: "가을", hint: "단풍이 들고 서늘한 계절", initials: "ㄱㅇ" },
    { answer: "봄", hint: "꽃이 피고 따뜻한 계절", initials: "ㅂ" },
    { answer: "사계절", hint: "봄, 여름, 가을, 겨울", initials: "ㅅㄱㅈ" },
    { answer: "지구", hint: "우리가 살고 있는 별", initials: "ㅈㄱ" },
    { answer: "우주", hint: "하늘 너머 끝없는 공간", initials: "ㅇㅈ" },
    { answer: "별똥별", hint: "하늘에서 떨어지는 별", initials: "ㅂㄸㅂ" },
    { answer: "달력", hint: "날짜를 확인해요", initials: "ㄷㄹ" },
    { answer: "공책", hint: "글씨를 쓰는 책", initials: "ㄱㅊ" },
    { answer: "색연필", hint: "다양한 색깔의 연필", initials: "ㅅㅇㅍ" },
    { answer: "크레파스", hint: "두꺼운 막대 모양 그림 도구", initials: "ㅋㄹㅍㅅ" },
    { answer: "가위", hint: "종이를 잘라요", initials: "ㄱㅇ" },
    { answer: "풀", hint: "종이를 붙여요", initials: "ㅍ" },
    { answer: "책", hint: "글이 인쇄된 종이 묶음", initials: "ㅊ" },
    { answer: "도서관", hint: "책을 빌려보는 곳", initials: "ㄷㅅㄱ" },
    { answer: "운동장", hint: "뛰어놀 수 있는 넓은 마당", initials: "ㅇㄷㅈ" },
    { answer: "축구", hint: "발로 공을 차는 운동", initials: "ㅊㄱ" },
    { answer: "농구", hint: "골대에 공을 넣는 운동", initials: "ㄴㄱ" },
    { answer: "수영", hint: "물속에서 헤엄치는 것", initials: "ㅅㅇ" },
    { answer: "달리기", hint: "가장 빠르게 뛰는 것", initials: "ㄷㄹㄱ" },
    { answer: "노래", hint: "음악에 맞춰 부르는 것", initials: "ㄴㄹ" },
    { answer: "음악", hint: "소리로 이루어진 예술", initials: "ㅇㅇ" },
    { answer: "미술", hint: "그림을 그리는 예술", initials: "ㅁㅅ" },
    { answer: "춤", hint: "음악에 맞춰 몸을 움직여요", initials: "ㅊ" },
    { answer: "강아지", hint: "친구가 되는 동물", initials: "ㄱㅇㅈ" },
    { answer: "고양이", hint: "야옹하고 울어요", initials: "ㄱㅇㅇ" },
    { answer: "쥐", hint: "치즈를 좋아하는 작은 동물", initials: "ㅈ" },
    { answer: "새", hint: "하늘을 날아다니는 동물", initials: "ㅅ" },
    { answer: "물고기", hint: "물속에 살아요", initials: "ㅁㄱㄱ" },
    { answer: "나무", hint: "숲을 이루는 식물", initials: "ㄴㅁ" },
    { answer: "꽃", hint: "아름다운 식물의 부분", initials: "ㄲ" },
    { answer: "숲", hint: "나무가 우거진 곳", initials: "ㅅ" },
    { answer: "바다", hint: "넓고 푸른 짠물", initials: "ㅂㄷ" },
    { answer: "강", hint: "산에서 흘러 내려와요", initials: "ㄱ" },
    { answer: "하늘", hint: "머리 위 푸른 공간", initials: "ㅎㄴ" },
    { answer: "땅", hint: "우리가 딛고 서 있는 곳", initials: "ㄸ" },
    { answer: "식탁", hint: "밥을 먹을 때 쓰는 가구", initials: "ㅅㅌ" },
    { answer: "밥그릇", hint: "밥을 담는 그릇", initials: "ㅂㄱㄹ" },
    { answer: "수저", hint: "밥을 먹을 때 쓰는 도구", initials: "ㅅㅈ" },
    { answer: "컵", hint: "물을 마셔요", initials: "ㅋ" },
    { answer: "주전자", hint: "물을 끓이거나 담는 통", initials: "ㅈㅈㅈ" },
    { answer: "접시", hint: "반찬을 담는 평평한 그릇", initials: "ㅈㅅ" },
    { answer: "가족", hint: "부모님과 형제자매", initials: "ㄱㅈ" },
    { answer: "친구", hint: "나와 가깝게 지내는 사람", initials: "ㅊㄱ" },
    { answer: "선생님", hint: "지식을 가르쳐 주는 사람", initials: "ㅅㅅㄴ" },
    { answer: "부모님", hint: "나를 낳아 주신 분", initials: "ㅂㅁㄴ" },
    { answer: "동생", hint: "나보다 나이가 어린 형제", initials: "ㄷㅅ" },
    { answer: "형", hint: "남자에게 나이가 많은 남자 형제", initials: "ㅎ" },
    { answer: "누나", hint: "남자에게 나이가 많은 여자 형제", initials: "ㄴㄴ" }
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
let catWeapon = {}; 
let bullets = [];
let weaponInterval = null; 

// 시각적 피드백
let comboMessage = ''; 
let comboMessageTimer = null; 
const comboMessageDuration = 1000; 

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
    scoreDisplay.textContent = score;

    // 뱀 시작 위치를 새로운 캔버스 중앙 근처 (12, 7)로 조정 (25x15 타일)
    snake = [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }];

    generateItem('cheese');
    generateItem('bomb');
    generateItem('mushroom');
    generateItem('clock');
    generateItem('bigCheese'); 
    generateItem('catWeapon');

    if (weaponInterval) clearInterval(weaponInterval);
    bullets = [];

    startGameLoop(); 
}

function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, currentSpeed); 
}

function getRandomPosition() {
    return {
        x: Math.floor(Math.random() * tileCount),
        // 세로 타일 개수를 캔버스 높이를 이용해 계산합니다.
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
    if (!isGameActive) return;

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
    } else if (checkItemCollision(head, catWeapon)) {
        if (snake.length > 3) snake.pop(); else { gameOver(); return; }
        applyWeaponDebuff();
        ateItem = true;
        generateItem('catWeapon');
    } else if (checkItemCollision(head, bomb)) {
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

    // 4-1. 총알(디버프) 충돌 감지
    bullets.forEach(bullet => {
        if (checkItemCollision(head, bullet)) {
             if (snake.length > 2) { snake.pop(); } else { gameOver(); }
             bullets = bullets.filter(b => b !== bullet); 
        }
    });

    // 5. 꼬리 자르기 / 퀴즈 시작 결정
    if (quizRequired) {
        snake.pop(); 
        isGameActive = false;
        startQuiz();
    } else if (!ateItem) {
        snake.pop(); 
    }
    
    drawGame();
}

// 충돌 및 속도 함수
function checkWallCollision(head) {
    // 세로 충돌 검사 시 캔버스 높이를 이용합니다.
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
// 4. 퀴즈 및 콤보 시스템
// ===================================================================

function startQuiz() {
    const quizData = words[Math.floor(Math.random() * words.length)];
    currentQuizWord = quizData.answer;
    let timeLeft = 10;
    
    quizQuestionElement.textContent = `문제: ${quizData.hint} / 초성: ${quizData.initials} (${timeLeft}초)`;
    quizInput.value = '';
    quizOverlay.classList.remove('hidden');
    
    // 타자 입력 포커스 확보
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

    if (isCorrect) {
        // 콤보 및 점수 계산
        comboCount++; 
        comboMultiplier = 1 + Math.floor(comboCount / 3) * 0.5; 
        let points = 100 * comboMultiplier;
        score += points; 
        
        // 난이도 상승
        level++;
        const newSpeed = initialSpeed * Math.pow(speedIncreaseRate, level); 
        currentSpeed = Math.max(newSpeed, 50); 

        // 콤보 메시지 설정
        if (comboCount > 1) {
            comboMessage = `${comboCount} 콤보! (X ${comboMultiplier.toFixed(1)})`;
        } else {
            comboMessage = ''; 
        }
        
        // 뱀 꼬리 증가
        snake.unshift({ x: snake[0].x, y: snake[0].y }); 
        
    } else {
        // 오답 시 콤보 초기화 및 피드백
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
    drawGame();
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

    // 뱀 그리기
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#16a085' : '#1abc9c';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeStyle = '#2c3e50';
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // 아이템 그리기 (각 심볼로 대체)
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
    
    finalScoreDisplay.textContent = score;
    messageDisplay.classList.remove('hidden'); 
}

// 키보드 입력 처리 (방향키 및 Enter 재시작 기능 추가, 스크롤 방지 로직 추가)
document.addEventListener('keydown', (e) => {
    let newDirection = { x: direction.x, y: direction.y };
    let handled = false; // 기본 동작을 막았는지 확인하는 플래그

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
    // Enter 키로 게임 재시작 기능
    else if (e.key === 'Enter' && messageDisplay.classList.contains('hidden') === false) {
        window.location.reload();
        handled = true;
    }
    
    // 방향키와 WASD 키에 대해 브라우저의 기본 동작(스크롤)을 막습니다.
    if (handled || e.key.startsWith('Arrow')) {
        e.preventDefault(); 
    }

    nextDirection = newDirection;
});

// 퀴즈 제출 이벤트 리스너
quizSubmitButton.addEventListener('click', () => {
    if (quizInput.value.toLowerCase() === currentQuizWord.toLowerCase()) {
        handleQuizResult(true);
    } else {
        handleQuizResult(false);
    }
});

quizInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        // 퀴즈 입력 중 엔터는 퀴즈 제출로 작동
        quizSubmitButton.click();
    }
});

// 다크 모드 토글
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); 
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ 라이트 모드' : '🌙 다크 모드';
});

// 게임 시작
initializeGame();
