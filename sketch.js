let video;
let handPose;
let hands = [];

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
}

function draw() {
  // 翻轉畫布以修正影像左右顛倒
  translate(width, 0);
  scale(-1, 1);

  // 將攝影機影像繪製到畫布上
  image(video, 0, 0, width, height);

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

  // 恢復畫布翻轉，繪製不被翻轉的文字
  resetMatrix();
  fill(255, 0, 0);
  textSize(32);
  text('影像辨識中...', 10, 40);
}

function gotHands(results) {
  console.log('Detected hands:', results); // 檢查偵測到的手部數量
  hands = results; // 儲存所有偵測到的手部資料
}

