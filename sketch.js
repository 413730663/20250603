let video;
let handPose;
let hands = [];
let bubbles = [];
let questions = [
  {
    q: "淡江教育科技學系英文簡稱是什麼?",
    options: ["1.TKUET", "2.TKUIE", "3.TKUIB", "4.TKUIC"],
    answer: 0
  },
  {
    q: "以下哪項是淡江教育科技學系的大一必修課程?",
    options: ["1.數位學習導入與經營", "2.教學設計", "3.介面設計", "4.平面設計"],
    answer: 3
  },
  {
    q: "下列哪項是淡江教育科技學系的專業選修課程?",
    options: ["1.3D動畫製作", "2.國文", "3.體育", "4.微積分"],
    answer: 0
  },
  {
    q: "以下哪項是讀教育科技學系的未來進路?",
    options: ["1.教學設計師", "2.教育訓練人員", "3.多媒體/動畫設計人員", "4.以上皆是"],
    answer: 3
  },
  {
    q: "下列哪個選項是教育科技學系最重視多元能力特質?",
    options: ["1.敏銳創造", "2.語文理解與表達", "3.記憶詮釋", "4.快速知覺與總結"],
    answer: 1 
  }
];
let currentQuestion = 0;
let gameOver = false;
let gameClear = false; // 新增：過關狀態
const displayOrder = [0, 1, 2, 3]; // 泡泡順序 (左上、右上、右下、左下)
// 0: 左上, 1: 右上, 2: 左下, 3: 右下
let videoW = 0, videoH = 0, videoX = 0, videoY = 0;
let canAnswer = true;
let answerTimer = 0;
let answerDelay = 5000; // 5秒
let gestureResult = null;

function preload() {
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handPose = ml5.handpose(video, () => {
    console.log('Handpose model loaded!');
  });
  handPose.on('predict', gotHands);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupBubbles();
  let btn = createButton('下一題');
  btn.position(10, height + 10);
  btn.mousePressed(nextQuestion);

  // 計算縮小後的視訊大小與位置（放在畫面正下方）
  videoW = int(width * 0.3);
  videoH = int(video.height * (videoW / video.width));
  videoX = width / 2 - videoW / 2;
  videoY = height - videoH - 20; // 距離底部20px

  answerTimer = millis();
  gestureResult = null;
  canAnswer = true;
  gameClear = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setupBubbles();
  videoW = int(width * 0.3);
  videoH = int(video.height * (videoW / video.width));
  videoX = width / 2 - videoW / 2;
  videoY = height - videoH - 20;
}

function setupBubbles() {
  let r = 75;
  bubbles = [
    { x: r, y: r, r: r },                             // 左上
    { x: width - r, y: r, r: r },                     // 右上
    { x: r, y: height - r, r: r },                    // 左下
    { x: width - r, y: height - r, r: r }             // 右下
  ];
}

function draw() {
  background(255);

  // 過關畫面
  if (gameClear) {
    fill(0, 180, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("恭喜過關！遊戲結束", width / 2, height / 2 - 30);
    textSize(28);
    text("點擊畫面重新挑戰", width / 2, height / 2 + 30);
    return;
  }

  // 題目顯示在畫面正上方
  fill(0);
  textSize(28);
  textAlign(CENTER, TOP);
  text(questions[currentQuestion].q, width / 2, 20);

  // 繪製泡泡
  textSize(14);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < bubbles.length; i++) {
    let bubble = bubbles[i];
    fill(0, 0, 255, 150);
    noStroke();
    ellipse(bubble.x, bubble.y, bubble.r * 2);

    // 選項文字
    fill(255);
    push();
    translate(bubble.x, bubble.y);
    text(questions[currentQuestion].options[displayOrder[i]], 0, 0);
    pop();
  }

  // 視訊畫面縮小後置中顯示，並水平翻轉
  push();
  translate(videoX + videoW, videoY);
  scale(-1, 1);
  image(video, 0, 0, videoW, videoH);
  pop();

  // 將手部關鍵點座標轉換到縮小後的視訊畫面上
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      let keypoint = hand.landmarks[j];
      // 原始座標是640x480，需轉換到縮小後的位置（同時水平翻轉）
      let x = map(keypoint[0], 0, 640, videoX, videoX + videoW);
      x = videoX + videoW - (x - videoX); // 水平翻轉
      let y = map(keypoint[1], 0, 480, videoY, videoY + videoH);
      fill(0, 255, 0);
      noStroke();
      circle(x, y, 10);
    }
  }

  // 顯示倒數計時
  if (!gameOver) {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, TOP);
    let remain = max(0, ceil((answerDelay - (millis() - answerTimer)) / 1000));
    text("請在 " + remain + " 秒內比出手勢", width / 2, 60);
  }

  // 只在5秒內記錄手勢
  if (!gameOver && hands.length > 0 && millis() - answerTimer < answerDelay) {
    let gesture = detectFingerNumber(hands[0]);
    if (gesture !== null) {
      gestureResult = gesture;
    }
  }

  // 5秒到才判斷
  if (!gameOver && !gameClear && millis() - answerTimer >= answerDelay && canAnswer) {
    canAnswer = false; // 只判斷一次
    if (gestureResult === questions[currentQuestion].answer + 1) {
      setTimeout(() => {
        // 若已經是最後一題，顯示過關畫面
        if (currentQuestion === questions.length - 1) {
          gameClear = true;
        } else {
          nextQuestion();
        }
      }, 1000); // 1秒後進入下一題或過關
    } else {
      setTimeout(() => {
        gameOver = true;
      }, 1000);
    }
  }

  if (gameOver) {
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 30);
    textSize(28);
    text("點擊螢幕重新開始", width / 2, height / 2 + 30);
  }
}

// 偵測伸出幾根手指（1~4），只判斷食指~小指
function detectFingerNumber(hand) {
  let tips = [8, 12, 16, 20]; // 食指~小指
  let bases = [6, 10, 14, 18];
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (hand.landmarks[tips[i]][1] < hand.landmarks[bases[i]][1]) {
      count++;
    }
  }
  if (count >= 1 && count <= 4) {
    return count;
  }
  return null;
}

function gotHands(results) {
  hands = results;
}

function nextQuestion() {
  currentQuestion++;
  setupBubbles();
  gameOver = false;
  gestureResult = null;
  answerTimer = millis(); // 重新計時
  canAnswer = true;
}

function mousePressed() {
  if (gameOver || gameClear) {
    currentQuestion = 0;
    setupBubbles();
    gameOver = false;
    gameClear = false;
    gestureResult = null;
    answerTimer = millis(); // 重新計時
    canAnswer = true;
  }
}

