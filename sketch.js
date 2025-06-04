let video;
let handPose;
let hands = [];
let bubbles = [];
let questions = [
  {
    q: "淡江教育科技學系英文簡稱是什麼?",
    options: ["TKUET", "TKUIE", "TKUIB", "TKUIC"],
    answer: 0 // 0代表第一個選項"TKUET"
  },
  {
    q: "以下哪項是淡江教育科技學系的大一必修課程?",
    options: ["數位學習導入與經營", "教學設計", "介面設計", "平面設計"],
    answer: 3 // 3代表第四個選項"平面設計"
  },
  {
    q: "下列哪項是淡江教育科技學系的專業選修課程?",
    options: ["3D動畫製作", "國文", "體育", "微積分"],
    answer: 0 // 0代表第一個選項"3D動畫製作"
  }
];
let currentQuestion = 0;

function preload() {
  // 啟用攝影機並將其作為影像來源
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 初始化 handpose 模型
  handPose = ml5.handpose(video, () => {
    console.log('Handpose model loaded!');
  });

  // 當模型有偵測結果時，觸發回呼函數
  handPose.on('predict', gotHands);
}

function setup() {
  createCanvas(640, 480);
  console.log('Setup complete!');

  // 生成 4 顆泡泡，分別位於四個角落，半徑改為75
  let r = 75; // 泡泡半徑
  bubbles = [
    { x: r, y: r, r: r },                         // 左上
    { x: width - r, y: r, r: r },                 // 右上
    { x: r, y: height - r, r: r },                // 左下
    { x: width - r, y: height - r, r: r }         // 右下
  ];
  let btn = createButton('下一題');
  btn.position(10, height + 10);
  btn.mousePressed(nextQuestion);
}

function draw() {
  // 翻轉畫布以修正影像左右顛倒
  translate(width, 0);
  scale(-1, 1);

  // 將攝影機影像繪製到畫布上
  image(video, 0, 0, width, height);

  // 題目顯示在畫面正上方
  resetMatrix();
  fill(0);
  textSize(28);
  textAlign(CENTER, TOP);
  text(questions[currentQuestion].q, width / 2, 20);

  // 回到翻轉狀態繪製泡泡與選項
  translate(width, 0);
  scale(-1, 1);

  // 泡泡與選項
  textSize(20);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < bubbles.length; i++) {
    let bubble = bubbles[i];
    fill(0, 0, 255, 150);
    noStroke();
    ellipse(bubble.x, bubble.y, bubble.r * 2);

    // 選項文字
    fill(255);
    text(questions[currentQuestion].options[i], bubble.x, bubble.y);
  }

  // 繪製所有偵測到的手部關鍵點
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      let keypoint = hand.landmarks[j];
      fill(0, 255, 0); // 綠色填充
      noStroke();
      circle(keypoint[0], keypoint[1], 10); // 繪製關鍵點
    }
  }
}

// 當前偵測到的手部資料
function gotHands(results) {
  hands = results; // 儲存所有偵測到的手部資料
}

// 切換到下一題
function nextQuestion() {
  currentQuestion = (currentQuestion + 1) % questions.length;
}

