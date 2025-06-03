let video;
let handPose;
let hands = [];
let font;

function preload() {
  // 載入 handPose 模型
  handPose = ml5.handPose();
  font = loadFont('Outfit-Regular.ttf'); // 確保字型檔案存在於專案目錄中
}

function setup() {
  // 建立一個 640x480 的畫布
  createCanvas(640, 480);

  // 啟用攝影機並將其作為影像來源
  video = createCapture(VIDEO);
  video.size(640, 480); // 設定影像大小
  video.hide(); // 隱藏原始的 HTML 視訊元素

  // 啟動 handPose 模型並開始偵測手部
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 翻轉畫布以修正影像左右顛倒
  translate(width, 0); // 將原點移到畫布右上角
  scale(-1, 1); // 水平翻轉畫布

  // 將攝影機影像繪製到畫布上
  image(video, 0, 0, width, height);

  // 繪製所有偵測到的手部關鍵點
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0); // 綠色填充
      noStroke();
      circle(keypoint.x, keypoint.y, 10); // 繪製關鍵點
    }
  }

  // 恢復畫布翻轉，繪製不被翻轉的文字
  resetMatrix(); // 重置畫布的變換
  fill(255, 0, 0);
  textSize(32);
  text('影像辨識中...', 10, 40);
}

// handPose 模型的回呼函數，當有偵測結果時觸發
function gotHands(results) {
  // 將結果儲存到 hands 變數
  hands = results;
}

