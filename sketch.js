let video;
let handPose;
let hands = [];
let bubbles = [];
let questions = [
  {
    q: "淡江教育科技學系英文簡稱是什麼?",
    options: ["TKUET", "TKUIE", "TKUIB", "TKUIC"],
    answer: 0
  },
  {
    q: "以下哪項是淡江教育科技學系的大一必修課程?",
    options: ["數位學習導入與經營", "教學設計", "介面設計", "平面設計"],
    answer: 3
  },
  {
    q: "下列哪項是淡江教育科技學系的專業選修課程?",
    options: ["3D動畫製作", "國文", "體育", "微積分"],
    answer: 0
  }
];
let currentQuestion = 0;
let gameOver = false;

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
    text(questions[currentQuestion].options[i], 0, 0);
    pop();
  }

  // 繪製所有偵測到的手部關鍵點，並檢查碰撞
  let answered = false;
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      let keypoint = hand.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint[0], keypoint[1], 10);

      // 檢查是否碰到泡泡
      for (let k = 0; k < bubbles.length; k++) {
        let bubble = bubbles[k];
        let d = dist(keypoint[0], keypoint[1], bubble.x, bubble.y);
        if (d < bubble.r && !answered) {
          answered = true;
          if (k === questions[currentQuestion].answer) {
            nextQuestion();
          } else {
            gameOver = true;
          }
        }
      }
    }
  }
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

