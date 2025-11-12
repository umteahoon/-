// ===================================================================
// 0. Firebase 설정 및 초기화 (최상단에 추가)
// ===================================================================

const firebaseConfig = {
  // ⚠️ 중요: Firebase 콘솔에서 획득한 실제 값을 여기에 넣어주세요!
  apiKey: "AIzaSyB08hQngath_bP_zeoSs3e2oEo777MlSmg", 
  authDomain: "cheesehunter-f3348.firebaseapp.com",
  projectId: "cheesehunter-f3348",
  storageBucket: "cheesehunter-f3348.appspot.com",
  messagingSenderId: "278725955857",
  appId: "1:278725955857:web:55b8f4e256b5540d24bcb0",
  measurementId: "G-96PEZ553QX" 
};

// Firebase 초기화 및 Firestore 인스턴스 생성
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

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


const gridSize = 35; 
const tileCount = canvas.width / gridSize; 
 
// 게임 변수
let score = 0;
let snake = [{ x: 18, y: 18 }, { x: 17, y: 18 }, { x: 16, y: 18 }]; 
let direction = { x: 1, y: 0 }; 
let nextDirection = { x: 1, y: 0 }; 
let gameLoop;
let isGameActive = false;
let isPaused = false; // 일시정지 상태

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
    
    // [추가] 명예의 전당 UI 숨김 및 초기화
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    shareScoreButton.classList.add('hidden'); // 게임 시작 시 숨김
    
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

// [추가] 일시정지/재개 토글 함수
function togglePause() {
    if (!isGameActive) return; // 게임 오버 상태에서는 작동 안 함
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameLoop);
        drawGame(); // 일시정지 메시지 표시를 위해 다시 그리기
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
    let itemPoints = 0; // 팝업용 점수 변수
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
        if (itemPoints === 500) color = '#ffd700'; // 큰 치즈
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
        togglePause(); // 퀴즈 시작 시 일시정지 (자동으로)
    } else if (!ateItem) {
        snake.pop(); 
    }
    
    // 치즈/폭탄 재생성 확률
    if (Object.keys(bomb).length === 0 && Math.random() < 0.3) generateItem('bomb');
    if (Object.keys(cheese).length === 0 && Math.random() < 0.5) generateItem('cheese');
    
    drawGame();
}

// 충돌 및 속도 함수
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
    
    // [추가] 퀴즈 결과 팝업 생성
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
    // 퀴즈 완료 후 일시정지 해제
    togglePause(); 
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
    shareScoreButton.classList.remove('hidden'); // 공유 버튼 표시
    playerNameInput.focus();
}

// [추가/수정] 명예의 전당 로직: Firestore에서 점수를 로드
async function loadHighScores() {
    highScoresList.innerHTML = `<li>점수를 로드 중입니다...</li>`;
    
    try {
        const querySnapshot = await db.collection("scores")
            .orderBy("score", "desc")
            .limit(MAX_HIGH_SCORES)
            .get();

        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });

        // UI 업데이트
        highScoresList.innerHTML = scores.map((item, index) => {
            const displayScore = item.score !== undefined ? item.score : 0;
            const displayName = item.name || "UNNAMED";
            return `<li>${index + 1}. ${displayName} - ${displayScore}점</li>`;
        }).join('');
        
        if (scores.length === 0) {
             highScoresList.innerHTML = `<li>아직 등록된 점수가 없습니다.</li>`;
        }

    } catch (error) {
        console.error("Error loading high scores: ", error);
        highScoresList.innerHTML = `<li>점수 로드 실패! 콘솔을 확인하세요.</li>`;
        alert("점수 로드에 실패했습니다. Firebase 설정(규칙)을 확인하세요.");
    }
}

// [추가/수정] 명예의 전당 로직: Firestore에 점수를 저장
async function saveHighScore() {
    if (saveScoreButton.disabled) return;
    
    let name = playerNameInput.value.trim().toUpperCase();
    
    // 이름 길이 제한 및 필터링
    name = name.substring(0, 3);
    name = name.replace(/[^A-Z0-9ㄱ-ㅎ가-힣]/g, ''); // 특수 문자 및 HTML 태그 제거
    
    if (name.length === 0) {
        name = "GUEST";
    }

    const newScore = { 
        score: score, 
        name: name,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // 저장 시간 기록
    };
    
    // 버튼 비활성화 (등록 중...)
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = '등록 중...';

    try {
        await db.collection("scores").add(newScore);
        alert(`${name}님의 ${score}점이 명예의 전당에 등록되었습니다!`);
        
        // UI 업데이트 및 버튼/입력창 숨기기
        loadHighScores();
        playerNameInput.classList.add('hidden');
        saveScoreButton.classList.add('hidden');
    } catch (error) {
        console.error("Error writing document: ", error);
        alert("점수 등록에 실패했습니다. (콘솔 확인)");
        saveScoreButton.disabled = false;
        saveScoreButton.textContent = '점수 등록';
    }
}

// [추가] 소셜 공유 기능
function shareScore() {
    const finalScore = score;
    const playerName = playerNameInput.value.trim().substring(0, 3) || '치즈 헌터';
    const gameUrl = window.location.href.split('?')[0]; 
    
    const text = `🏆 치즈 헌터: ${playerName}님이 ${finalScore}점으로 게임 오버! 내가 최고 점수를 달성할 수 있을까? 지금 도전하세요!`;

    if (navigator.share) {
        navigator.share({
            title: '🧀 치즈 헌터 게임',
            text: text,
            url: gameUrl,
        }).catch((error) => console.log('공유 실패', error));
    } else {
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(gameUrl);
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
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
    // Enter 키로 게임 재시작 기능
    else if (e.key === 'Enter' && messageDisplay.classList.contains('hidden') === false && playerNameInput.classList.contains('hidden')) {
        window.location.reload();
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
