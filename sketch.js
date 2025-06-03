let video;

function setup() {
  // 建立一個 640x480 的畫布
  createCanvas(640, 480);

  // 啟用攝影機並將其作為影像來源
  video = createCapture(VIDEO);
  video.size(640, 480); // 設定影像大小
  video.hide(); // 隱藏原始的 HTML 視訊元素
}

function draw() {
  // 翻轉畫布以修正影像左右顛倒
  translate(width, 0); // 將原點移到畫布右上角
  scale(-1, 1); // 水平翻轉畫布

  // 將攝影機影像繪製到畫布上
  image(video, 0, 0, width, height);

  // 在畫布上繪製其他內容（例如辨識結果）
  fill(255, 0, 0);
  textSize(32);
  text('影像辨識中...', 10, 40);
}
