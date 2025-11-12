// 헌터.zip/헌터/game.js

// ===================================================================
// 0. Firebase 설정 및 초기화 (최상단에 추가)
// ===================================================================

const firebaseConfig = {
  apiKey: "AIzaSyB08hQngath_bP_zeoSs3e2oEo777MlSmg", // 스크린샷에서 획득
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
const analytics = firebase.analytics(); // Analytics 초기화 (선택적)

// ===================================================================
// 1. HTML 요소 및 기본 설정 (기존 코드 수정 및 추가)
// ===================================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const finalScoreDisplay = document.getElementById('final-score');

// [추가] 명예의 전당 및 공유 관련 요소
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');
const shareScoreButton = document.getElementById('share-score-button');
const highScoresList = document.getElementById('high-scores-list');
const MAX_HIGH_SCORES = 10;
// / [추가]

const quizOverlay = document.getElementById('quiz-overlay');
const quizQuestionElement = document.getElementById('quiz-question');
const quizInput = document.getElementById('quiz-input');
const quizSubmitButton = document.getElementById('quiz-submit-button');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const gridSize = 35; 
const tileCount = canvas.width / gridSize; 

// 게임 변수
let score = 0;
let snake = [{ x: 18, y: 18 }, { x: 17, y: 18 }, { x: 16, y: 18 }];
let direction = { x: 1, y: 0 }; 
let nextDirection = { x: 1, y: 0 }; 
let gameLoop;
let isGameActive = false;

// 퀴즈 및 콤보 변수 (이하 생략 - 기존 코드 유지)
const words = [
    // ... (기존 퀴즈 데이터 유지)
    { answer: "치즈", hint: "하얀 음식", initials: "ㅊㅈ" },
    { answer: "사과", hint: "달콤한 과일", initials: "ㅅㄱ" },
    // ... 
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

// 난이도 및 속도 변수 (이하 생략 - 기존 코드 유지)
const initialSpeed = 150; 
let currentSpeed = initialSpeed;
const speedIncreaseRate = 0.98;
let level = 1; 
let itemTimer = null; 

// 아이템 위치 객체 (이하 생략 - 기존 코드 유지)
let cheese = {};
let bomb = {};
let mushroom = {};
let clock = {};
let bigCheese = {}; 
let catWeapon = {}; 
let bullets = [];
let weaponInterval = null; 

// 시각적 피드백 (이하 생략 - 기존 코드 유지)
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
    
    // [추가] 명예의 전당 UI 숨김 및 초기화
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    shareScoreButton.classList.add('hidden'); // 게임 시작 시 숨김
    
    scoreDisplay.textContent = score;

    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

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

// ... (나머지 기존 유틸리티 함수 유지)

// ===================================================================
// 3. 핵심 게임 루프 (updateGame) (이하 생략 - 기존 코드 유지)
// ===================================================================

function updateGame() {
    // ... (기존 updateGame 함수 로직 유지)
    
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

// ... (기존 충돌 및 속도 함수 유지)

// ===================================================================
// 4. 퀴즈 및 콤보 시스템 (이하 생략 - 기존 코드 유지)
// ===================================================================

// ... (기존 퀴즈 및 콤보 함수 유지)

// ===================================================================
// 5. 그리기 함수 (drawGame) (이하 생략 - 기존 코드 유지)
// ===================================================================

// ... (기존 그리기 함수 유지)

// ===================================================================
// 6. 이벤트 및 게임 종료 (명예의 전당 및 공유 로직 추가)
// ===================================================================

function gameOver() {
    isGameActive = false;
    clearInterval(gameLoop);
    if (itemTimer) clearTimeout(itemTimer);
    if (weaponInterval) clearInterval(weaponInterval);
    
    finalScoreDisplay.textContent = `최종 점수: ${score}점`; // 점수 표시 업데이트
    messageDisplay.classList.remove('hidden'); 
    
    // [추가] 점수 등록 및 공유 버튼 표시
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    shareScoreButton.classList.remove('hidden');
    playerNameInput.focus();
}

// [추가] Firebase Firestore에서 점수를 로드
function loadHighScores() {
    highScoresList.innerHTML = `<li>점수를 로드 중입니다...</li>`;
    
    db.collection("scores")
        .orderBy("score", "desc")
        .limit(MAX_HIGH_SCORES)
        .get()
        .then((querySnapshot) => {
            const scores = [];
            querySnapshot.forEach((doc) => {
                scores.push(doc.data());
            });

            // UI 업데이트
            highScoresList.innerHTML = scores.map((item, index) => {
                // name과 score가 Firestore 문서에 저장된 필드 이름과 일치해야 합니다.
                // Firebase timestamp를 사용하면 item.timestamp.toDate().toLocaleTimeString() 등으로 변환 가능
                const displayScore = item.score !== undefined ? item.score : 0;
                const displayName = item.name || "UNNAMED";
                return `<li>${index + 1}. ${displayName} - ${displayScore}점</li>`;
            }).join('');
            
            if (scores.length === 0) {
                 highScoresList.innerHTML = `<li>아직 등록된 점수가 없습니다.</li>`;
            }
        })
        .catch((error) => {
            console.error("Error loading high scores: ", error);
            highScoresList.innerHTML = `<li>점수 로드 실패!</li>`;
        });
}

// [추가] Firebase Firestore에 점수를 저장
function saveHighScore() {
    // 이미 등록했으면 중복 등록 방지
    if (saveScoreButton.disabled) return;
    
    let name = playerNameInput.value.trim().toUpperCase();
    
    // 이름 길이 제한 및 필터링
    name = name.substring(0, 3);
    name = name.replace(/[^A-Z0-9ㄱ-ㅎ가-힣]/g, ''); // 특수 문자 제거
    
    if (name.length === 0) {
        name = "GUEST";
    }

    const newScore = { 
        score: score, // 현재 전역 변수 score 사용
        name: name,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // 저장 시간 기록
    };
    
    // 버튼 비활성화 (등록 중...)
    saveScoreButton.disabled = true;
    saveScoreButton.textContent = '등록 중...';

    db.collection("scores").add(newScore)
    .then(() => {
        alert(`${name}님의 ${score}점이 명예의 전당에 등록되었습니다!`);
        // UI 업데이트 및 버튼/입력창 숨기기
        loadHighScores();
        playerNameInput.classList.add('hidden');
        saveScoreButton.classList.add('hidden');
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        alert("점수 등록에 실패했습니다. (콘솔 확인)");
        saveScoreButton.disabled = false;
        saveScoreButton.textContent = '점수 등록';
    });
}

// [추가] 소셜 공유 기능
function shareScore() {
    const finalScore = score;
    const playerName = playerNameInput.value.trim().substring(0, 3) || '치즈 헌터';
    // Netlify URL을 사용자가 배포한 실제 URL로 변경해야 합니다.
    const gameUrl = window.location.href.split('?')[0]; 
    
    // 메시지 구성 (카카오톡, X(트위터) 등에 적합)
    const text = `🏆 치즈 헌터: ${playerName}님이 ${finalScore}점으로 게임 오버! 내가 최고 점수를 달성할 수 있을까? 지금 도전하세요!`;

    // Web Share API 지원 여부 확인 (모바일 환경에서 최적)
    if (navigator.share) {
        navigator.share({
            title: '🧀 치즈 헌터 게임',
            text: text,
            url: gameUrl,
        }).catch((error) => console.log('공유 실패', error));
    } else {
        // Web Share API를 지원하지 않는 경우 (PC 환경 등)
        const encodedText = encodeURIComponent(text);
        const encodedUrl = encodeURIComponent(gameUrl);
        
        // Twitter(X) 공유 팝업 열기 (가장 일반적인 대체 방식)
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
}

// 키보드 입력 처리 (이하 생략 - 기존 코드 유지)
document.addEventListener('keydown', (e) => {
    // ... (기존 키보드 입력 로직 유지)
});

// 퀴즈 제출 이벤트 리스너 (이하 생략 - 기존 코드 유지)
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

// [추가] 점수 등록 및 공유 이벤트 리스너
saveScoreButton.addEventListener('click', saveHighScore);
shareScoreButton.addEventListener('click', shareScore);

// 다크 모드 토글 (이하 생략 - 기존 코드 유지)
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); 
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ 라이트 모드' : '🌙 다크 모드';
});

// 게임 시작
initializeGame();
