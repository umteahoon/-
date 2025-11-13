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
// [추가] 명예의 전당 관련 요소
const playerNameInput = document.getElementById('player-name-input');
const saveScoreButton = document.getElementById('save-score-button');
const scoreList = document.getElementById('score-list');

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
    { answer: "누나", hint: "남자에게 나이가 많은 여자 형제", initials: "ㄴㄴ" },
    { answer: "바나나", hint: "길고 노란 열대 과일", initials: "ㅂㄴㄴ" },
    { answer: "딸기", hint: "빨갛고 씨가 있는 작은 과일", initials: "ㄸㄱ" },
    { answer: "수박", hint: "여름에 먹는 크고 둥근 과일", initials: "ㅅㅂ" },
    { answer: "포도", hint: "작은 알갱이가 송이로 맺혀요", initials: "ㅍㄷ" },
    { answer: "귤", hint: "겨울에 까먹는 주황색 과일", initials: "ㄱ" },
    { answer: "토마토", hint: "빨간색 채소 같지만 과일", initials: "ㅌㅁㅌ" },
    { answer: "당근", hint: "토끼가 좋아하는 주황색 채소", initials: "ㄷㄱ" },
    { answer: "양파", hint: "썰면 눈이 매운 채소", initials: "ㅇㅍ" },
    { answer: "감자", hint: "땅속에서 나는 동그란 채소", initials: "ㄱㅈ" },
    { answer: "김치", hint: "한국의 매운 전통 반찬", initials: "ㄱㅊ" },
    { answer: "밥", hint: "쌀로 지은 주식", initials: "ㅂ" },
    { answer: "국", hint: "뜨거운 물에 건더기를 넣은 요리", initials: "ㄱ" },
    { answer: "물", hint: "생명 유지에 필수적인 액체", initials: "ㅁ" },
    { answer: "커피", hint: "검고 쓴 음료", initials: "ㅋㅍ" },
    { answer: "우유", hint: "소에게서 나오는 하얀 액체", initials: "ㅇㅇ" },
    { answer: "빵", hint: "밀가루로 만들어 구운 음식", initials: "ㅃ" },
    { answer: "케이크", hint: "생일이나 기념일에 먹는 달콤한 빵", initials: "ㅋㅇㅋ" },
    { answer: "피자", hint: "둥근 도우 위에 치즈와 토핑", initials: "ㅍㅈ" },
    { answer: "라면", hint: "끓여 먹는 면 요리", initials: "ㄹㅁ" },
    { answer: "돈", hint: "물건을 사거나 대가를 지불하는 수단", initials: "ㄷ" },
    { answer: "지갑", hint: "돈과 카드를 넣어 다니는 것", initials: "ㅈㄱ" },
    { answer: "열쇠", hint: "문을 잠그거나 여는 도구", initials: "ㅇㅆ" },
    { answer: "문", hint: "방이나 건물의 입구", initials: "ㅁ" },
    { answer: "창문", hint: "밖을 볼 수 있는 유리로 된 부분", initials: "ㅊㅁ" },
    { answer: "액자", hint: "그림이나 사진을 넣어 걸어요", initials: "ㅇㅈ" },
    { answer: "달", hint: "밤하늘에 뜨는 둥근 천체", initials: "ㄷ" },
    { answer: "해", hint: "낮에 뜨는 밝은 천체", initials: "ㅎ" },
    { answer: "별", hint: "밤하늘에 반짝이는 작은 점", initials: "ㅂ" },
    { answer: "날씨", hint: "하늘의 상태, 비나 눈 등", initials: "ㄴㅆ" },
    { answer: "옷", hint: "몸에 입는 것", initials: "ㅇ" },
    { answer: "모자", hint: "머리에 쓰는 것", initials: "ㅁㅈ" },
    { answer: "장갑", hint: "손에 끼는 것", initials: "ㅈㄱ" },
    { answer: "목도리", hint: "겨울에 목에 두르는 것", initials: "ㅁㄷㄹ" },
    { answer: "바지", hint: "다리에 입는 옷", initials: "ㅂㅈ" },
    { answer: "치마", hint: "여성들이 다리에 두르는 옷", initials: "ㅊㅁ" },
    { answer: "운동화", hint: "운동할 때 신는 신발", initials: "ㅇㄷㅎ" },
    { answer: "샌들", hint: "여름에 신는 시원한 신발", initials: "ㅅㄷ" },
    { answer: "책가방", hint: "책을 넣어 다니는 가방", initials: "ㅊㄱㅂ" },
    { answer: "연고", hint: "다쳤을 때 바르는 약", initials: "ㅇㄱ" },
    { answer: "약", hint: "병을 치료하거나 통증을 줄여주는 것", initials: "ㅇ" },
    { answer: "온도계", hint: "온도를 재는 도구", initials: "ㅇㄷㄱ" },
    { answer: "체육관", hint: "실내에서 운동하는 곳", initials: "ㅊㅇㄱ" },
    { answer: "수영장", hint: "물놀이나 수영을 하는 곳", initials: "ㅅㅇㅈ" },
    { answer: "박물관", hint: "역사적인 유물을 전시하는 곳", initials: "ㅂㅁㄱ" },
    { answer: "미술관", hint: "그림이나 예술 작품을 전시하는 곳", initials: "ㅁㅅㄱ" },
    { answer: "극장", hint: "영화나 연극을 보는 곳", initials: "ㄱㅈ" },
    { answer: "노트북", hint: "휴대가 간편한 컴퓨터", initials: "ㄴㅌㅂ" },
    { answer: "마이크", hint: "소리를 크게 만드는 장치", initials: "ㅁㅇㅋ" },
    { answer: "카메라", hint: "사진이나 영상을 찍는 도구", initials: "ㅋㅁㄹ" },
    { answer: "헤드폰", hint: "귀에 쓰고 소리를 듣는 장치", initials: "ㅎㄷㅍ" },
    { answer: "전화", hint: "말소리를 전달하는 통신 수단", initials: "ㅈㅎ" },
    { answer: "손가락", hint: "손에 달린 다섯 개의 작은 부분", initials: "ㅅㄱㄹ" },
    { answer: "발가락", hint: "발에 달린 작은 부분", initials: "ㅂㄱㄹ" },
    { answer: "머리", hint: "생각하고 얼굴이 있는 신체 부위", initials: "ㅁㄹ" },
    { answer: "가슴", hint: "몸통의 앞쪽 윗부분", initials: "ㄱㅅ" },
    { answer: "배", hint: "몸통의 중앙 앞부분", initials: "ㅂ" },
    { answer: "다리", hint: "걷고 뛰는 데 사용하는 신체 부위", initials: "ㄷㄹ" },
    { answer: "무릎", hint: "다리의 중간에 굽혀지는 관절", initials: "ㅁㄹ" },
    { answer: "어깨", hint: "팔과 몸통이 연결되는 부분", initials: "ㅇㄲ" },
    { answer: "코", hint: "냄새를 맡는 신체 기관", initials: "ㅋ" },
    { answer: "입", hint: "음식을 먹고 말을 하는 기관", initials: "ㅇ" },
    { answer: "눈", hint: "세상을 보는 기관", initials: "ㄴ" },
    { answer: "귀", hint: "소리를 듣는 기관", initials: "ㄱ" },
    { answer: "손톱", hint: "손가락 끝에 붙어있는 단단한 부분", initials: "ㅅㅌ" },
    { answer: "발톱", hint: "발가락 끝에 붙어있는 단단한 부분", initials: "ㅂㅌ" },
    { answer: "수학", hint: "수와 공간을 연구하는 학문", initials: "ㅅㅎ" },
    { answer: "역사", hint: "과거의 일들을 기록한 것", initials: "ㅇㅅ" },
    { answer: "과학", hint: "자연 현상을 탐구하는 학문", initials: "ㄱㅎ" },
    { answer: "언어", hint: "말이나 글을 통해 소통하는 수단", initials: "ㅇㅇ" },
    { answer: "기쁨", hint: "즐겁고 행복한 감정", initials: "ㄱㅃ" },
    { answer: "슬픔", hint: "서글프고 눈물이 나는 감정", initials: "ㅅㅍ" },
    { answer: "화", hint: "분노하고 격렬한 감정", initials: "ㅎ" },
    { answer: "사랑", hint: "아끼고 좋아하는 마음", initials: "ㅅㄹ" },
    { answer: "미움", hint: "싫어하고 증오하는 감정", initials: "ㅁㅇ" },
    { answer: "시간", hint: "흐르는 동안의 개념", initials: "ㅅㄱ" },
    { answer: "계절", hint: "봄, 여름, 가을, 겨울", initials: "ㄱㅈ" },
    { answer: "어제", hint: "오늘의 바로 전날", initials: "ㅇㅈ" },
    { answer: "오늘", hint: "지금 이 날", initials: "ㅇㄴ" },
    { answer: "내일", hint: "오늘의 바로 다음날", initials: "ㄴㅇ" },
    { answer: "일주일", hint: "월요일부터 일요일까지의 기간", initials: "ㅇㅈㅇ" },
    { answer: "연간", hint: "일 년 동안", initials: "ㅇㄱ" },
    { answer: "비", hint: "하늘에서 떨어지는 물방울", initials: "ㅂ" },
    { answer: "눈", hint: "하늘에서 떨어지는 하얀 결정", initials: "ㄴ" },
    { answer: "번개", hint: "하늘에서 순간적으로 빛나는 불꽃", initials: "ㅂㄱ" },
    { answer: "천둥", hint: "번개와 함께 나는 큰 소리", initials: "ㅊㄷ" },
    { answer: "무지개", hint: "비 온 뒤 하늘에 뜨는 일곱 색깔 고리", initials: "ㅁㅈㄱ" },
    { answer: "파도", hint: "바다의 물결이 밀려오는 것", initials: "ㅍㄷ" },
    { answer: "햇살", hint: "따뜻하게 비추는 햇빛", initials: "ㅎㅆ" },
    { answer: "달팽이", hint: "껍데기를 등에 지고 다니는 작은 동물", initials: "ㄷㅍㅇ" },
    { answer: "토끼", hint: "귀가 길고 풀을 좋아하는 동물", initials: "ㅌㄲ" },
    { answer: "여우", hint: "꾀가 많은 것으로 알려진 동물", initials: "ㅇㅇ" },
    { answer: "사자", hint: "갈기가 있는 맹수", initials: "ㅅㅈ" },
    { answer: "호랑이", hint: "줄무늬가 있는 큰 맹수", initials: "ㅎㄹㅇ" },
    { answer: "원숭이", hint: "나무를 잘 타고 바나나를 좋아하는 동물", initials: "ㅇㅅㅇ" },
    { answer: "코끼리", hint: "코가 길고 덩치가 큰 동물", initials: "ㅋㄲㄹ" },
    { answer: "기린", hint: "목이 매우 긴 동물", initials: "ㄱㄹ" },
    { answer: "코알라", hint: "유칼립투스 잎을 먹고 사는 동물", initials: "ㅋㅇㄹ" },
    { answer: "펭귄", hint: "남극에 살며 날지 못하는 새", initials: "ㅍㄱ" },
    { answer: "북극곰", hint: "북극에 살고 흰 털을 가진 곰", initials: "ㅂㄱㄱ" },
    { answer: "돌고래", hint: "바다에 살며 지능이 높은 동물", initials: "ㄷㄱㄹ" },
    { answer: "새싹", hint: "식물이 처음 돋아나는 어린 잎", initials: "ㅆㅆ" },
    { answer: "뿌리", hint: "식물을 땅에 고정시키고 물을 흡수하는 부분", initials: "ㅃㄹ" },
    { answer: "가지", hint: "나무의 줄기에서 뻗어 나온 부분", initials: "ㄱㅈ" },
    { answer: "줄기", hint: "식물의 몸을 지탱하는 부분", initials: "ㅈㄱ" },
    { answer: "밭", hint: "채소를 기르는 넓은 땅", initials: "ㅂ" },
    { answer: "논", hint: "벼를 기르는 물이 있는 땅", initials: "ㄴ" }
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
// 고양이 무기 관련 변수 제거

// 시각적 피드백
let comboMessage = ''; 
let comboMessageTimer = null; 
const comboMessageDuration = 1000; 

// [추가] 명예의 전당 로직
const MAX_HIGH_SCORES = 5; 

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

    // [추가] 명예의 전당 관련 초기화
    playerNameInput.classList.add('hidden');
    saveScoreButton.classList.add('hidden');
    playerNameInput.value = '';
    loadHighScores(); // 게임 시작 시 점수 목록 로드

    // 뱀 시작 위치를 새로운 캔버스 중앙 근처 (12, 7)로 조정 (25x15 타일)
    snake = [{ x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }];

    generateItem('cheese');
    generateItem('bomb');
    generateItem('mushroom');
    generateItem('clock');
    generateItem('bigCheese'); 

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

    // bomb은 50% 확률로 생성되지 않도록 로직을 조정하여 등장 빈도 조절
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
    } 
    // 고양이 무기(catWeapon) 로직 제거
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

    // 4-1. 총알(디버프) 충돌 감지 로직 제거

    // 5. 꼬리 자르기 / 퀴즈 시작 결정
    if (quizRequired) {
        snake.pop(); 
        isGameActive = false;
        startQuiz();
    } else if (!ateItem) {
        snake.pop(); 
    }
    
    // [수정 사항]: bomb이 필드에 없을 경우, 30% 확률로 생성 시도하여 등장 빈도 증가
    if (Object.keys(bomb).length === 0 && Math.random() < 0.3) generateItem('bomb');
    
    // [수정 사항]: 치즈가 필드에 없을 경우, 50% 확률로 생성 시도하여 등장 빈도 증가
    if (Object.keys(cheese).length === 0 && Math.random() < 0.5) generateItem('cheese');
    
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
    
    finalScoreDisplay.textContent = `최종 점수: ${score}점`;
    messageDisplay.classList.remove('hidden'); 
    
    // [추가] 점수 등록 UI 표시
    playerNameInput.classList.remove('hidden');
    saveScoreButton.classList.remove('hidden');
    playerNameInput.focus();
}

// [추가] 명예의 전당 로직
function loadHighScores() {
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.sort((a, b) => b.score - a.score);
    
    scoreList.innerHTML = scores.map((item, index) => {
        return `<li>${index + 1}. ${item.name} - ${item.score}점</li>`;
    }).join('');
    return scores;
}

function saveHighScore() {
    let name = playerNameInput.value.trim().toUpperCase();
    
    // [보안 강화] HTML 특수 문자 제거 (XSS 방지)
    name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    if (name.length === 0) {
        name = "GUEST";
    }

    const newScore = { score, name };
    const scores = loadHighScores(); // 최신 점수 로드

    // 새로운 점수를 배열에 추가
    scores.push(newScore);
    
    // 점수 기준으로 정렬 (내림차순)
    scores.sort((a, b) => b.score - a.score);

    // 최대 개수 유지
    const topScores = scores.slice(0, MAX_HIGH_SCORES);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('highScores', JSON.stringify(topScores));
    
    // UI 업데이트 및 버튼 숨기기
    loadHighScores();
    playerNameInput.classList.add('hidden');
    saveScoreButton.classList.add('hidden');
}

// [추가] 점수 등록 버튼 이벤트 리스너
saveScoreButton.addEventListener('click', () => {
    saveHighScore();
});

// 키보드 입력 처리 (방향키 및 Enter 재시작 기능 추가, 스크롤 방지 로직 포함)
document.addEventListener('keydown', (e) => {
    let newDirection = { x: direction.x, y: direction.y };
    let handled = false; 

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
    // Enter 키로 게임 재시작 기능 (점수 등록 UI가 보이지 않을 때만 재시작 버튼 활성화)
    else if (e.key === 'Enter' && messageDisplay.classList.contains('hidden') === false && playerNameInput.classList.contains('hidden')) {
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

// [추가] 점수 입력 필드에서 엔터 키 처리
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
