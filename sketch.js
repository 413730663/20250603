let video;
let handPose;
let hands = [];
let bubbles = [];
let questions = [
  {
    q: "淡江教育科技學系英文簡稱是什麼?",
    options: ["TKUET", "TKUIE", "TKUIB", "TKUIC"],
    answer: 0 // 0:比1，1:比2，2:比3，3:比4
  },
  {
    q: "以下哪項是淡江教育科技學系的大一必修課程?",
    options: ["數位學習導入與經營", "教學設計", "介面設計", "平面設計"],
    answer: 3 // 0:比1，1:比2，2:比3，3:比4
  },
  {
    q: "下列哪項是淡江教育科技學系的專業選修課程?",
    options: ["3D動畫製作", "國文", "體育", "微積分"],
    answer: 0 // 0:比1，1:比2，2:比3，3:比4
  }
];
let currentQuestion = 0;
let gameOver = false;
const displayOrder = [1, 0, 3, 2]; // 泡泡順序

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
  createCanvas(640, 480);
  setupBubbles();
  let btn = createButton('下一題');
  btn.position(10, height + 10);
  btn.mousePressed(nextQuestion);
}

function setupBubbles() {
  let r = 75;
  bubbles = [
    { x: r, y: r, r: r },                         // 左上
    { x: width - r, y: r, r: r },                 // 右上
    { x: r, y: height - r, r: r },                // 左下
    { x: width - r, y: height - r, r: r }         // 右下
  ];
}

function draw() {
  background(255);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (gameOver) {
    resetMatrix();
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 30);
    textSize(28);
    text("點擊螢幕重新開始", width / 2, height / 2 + 30);
    return;
  }

  // 題目顯示在畫面正上方
  resetMatrix();
  fill(0);
  textSize(28);
  textAlign(CENTER, TOP);
  text(questions[currentQuestion].q, width / 2, 20);

  // 回到翻轉狀態繪製泡泡與選項
  translate(width, 0);
  scale(-1, 1);

  textSize(20);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < bubbles.length; i++) {
    let bubble = bubbles[i];
    fill(0, 0, 255, 150);
    noStroke();
    ellipse(bubble.x, bubble.y, bubble.r * 2);

    // 水平再翻轉一次文字
    push();
    translate(bubble.x, bubble.y);
    scale(-1, 1);
    fill(255);
    text(questions[currentQuestion].options[displayOrder[i]], 0, 0);
    pop();
  }

  // 繪製所有偵測到的手部關鍵點
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      let keypoint = hand.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint[0], keypoint[1], 10);
    }
  }

  // 判斷手勢（只判斷第一隻手）
  if (hands.length > 0) {
    let gesture = detectFingerNumber(hands[0]);
    if (gesture !== null) {
      if (gesture === questions[currentQuestion].answer + 1) {
        nextQuestion();
      } else {
        gameOver = true;
      }
    }
  }
}

// 偵測伸出幾根手指（1~4），只判斷食指~小指
function detectFingerNumber(hand) {
  // hand.landmarks: 21個點
  // 指尖索引: [4, 8, 12, 16, 20] (大拇指, 食指, 中指, 無名指, 小指)
  // 指根索引: [2, 5, 9, 13, 17]
  let tips = [8, 12, 16, 20]; // 食指~小指
  let bases = [6, 10, 14, 18];
  let count = 0;
  for (let i = 0; i < 4; i++) {
    if (hand.landmarks[tips[i]][1] < hand.landmarks[bases[i]][1]) {
      count++;
    }
  }
  // 只允許1~4根手指
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
  if (currentQuestion >= questions.length) {
    currentQuestion = 0;
  }
  setupBubbles();
  gameOver = false;
}

function mousePressed() {
  if (gameOver) {
    currentQuestion = 0;
    setupBubbles();
    gameOver = false;
  }
}

