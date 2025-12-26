// ===== ゲーム全体の状態をまとめた箱 =====
let game = {
  characterIndex: 0,   // 今のキャラ
  winStreak: 0,        // 現在の連勝
  maxWinStreak: 0,     // 最大連勝
  defeated: 0,         // 倒した人数
  losses: 0,           // 合計敗北数
  enemyHand: null,     // 敵の手
  canInput: false      // 入力していいか
};

const message = document.getElementById("message");
const character = document.getElementById("character");
const streakText = document.getElementById("streak");
const speedText = document.getElementById("speed");
const MIN_TEMPO = 450; // テンポの最速（下限）
const livesContainer = document.getElementById("lives");
const MAX_LIVES = 10;
const EARLY_INPUT_RATIO = 0.15; // 15%

let jankenTempo = 1200;
let speedLevel = 1;

// ページをクリックしたら開始
document.body.onclick = startJanken;

// ===== ジャンケン開始 =====
function startJanken() {
  document.body.onclick = null;
  game.canInput = false;

// 敵の手を先に決める
  game.enemyHand = randomHand();

  // ジャン
  message.textContent = "ジャン！";
  character.src = "jan.png";

  // ケン
  setTimeout(() => {
    message.textContent = "ケン！";
    character.src = "ken_" + game.enemyHand + ".png";
  }, jankenTempo);

  // 入力受付（ポンの少し前）
setTimeout(() => {
  game.canInput = true;
  game.ponTime = Date.now();
}, Math.max(0, jankenTempo * 2 - jankenTempo * EARLY_INPUT_RATIO));

  // ポン
  setTimeout(() => {
    message.textContent = "ポン！";
    character.src = "pon_" + game.enemyHand + ".png";
    game.canInput = true;
    game.ponTime = Date.now();
  }, jankenTempo * 2);
}

// ===== プレイヤー入力 =====
function playerHand(hand) {
  if (!game.canInput) return;

  game.canInput = false;

  // 遅すぎ判定（700ms）
  if (Date.now() - game.ponTime > 700) {
    lose("遅すぎ！");
    return;
  }

  judge(hand, game.enemyHand);
}

// ===== 勝敗判定 =====
function judge(player, enemy) {
  if (player === enemy) {
    message.textContent = "あいこ！";
    // 連勝リセット
    game.winStreak = 0;
    updateStreak();
    // 残機は減らさない
    setTimeout(startJanken, 1000);
    return;
  }

  const win =
    (player === "rock" && enemy === "scissors") ||
    (player === "scissors" && enemy === "paper") ||
    (player === "paper" && enemy === "rock");

  if (win) winRound();
  else lose("負け！");
}

// ===== 勝ち =====
function winRound() {
  game.winStreak++;
  updateStreak();

  game.maxWinStreak = Math.max(game.maxWinStreak, game.winStreak);
  message.textContent = "勝ち！";

  // 10連勝でキャラ撃破
  if (game.winStreak >= 10) {
    game.defeated++;
    game.winStreak = 0;
    updateStreak();

    // ★ここが追加：撃破時にテンポアップ
    jankenTempo = Math.max(MIN_TEMPO, jankenTempo - 150);

    // ★スピードLvアップ
    speedLevel++;
    updateSpeed();

    message.textContent =
      "撃破！\nスピードアップ！";
  }

  setTimeout(startJanken, jankenTempo);
}



// ===== 負け =====
function lose(text) {
  game.losses++;
  game.winStreak = 0;   // 連勝リセット
  updateStreak();      // ← ★④-5：表示もリセット
  updateLives(); // ★追加

  message.textContent = text;

  // ゲームオーバー判定
  if (game.losses >= 10) {
    message.textContent =
      "ゲームオーバー\n倒した人数：" + game.defeated

    document.getElementById("retryButton").style.display = "block";
    return;
  }

  setTimeout(startJanken, 1200);
}


// ===== ランダムな手 =====
function randomHand() {
  const hands = ["rock", "scissors", "paper"];
  return hands[Math.floor(Math.random() * 3)];
}

function retryGame() {
  game.characterIndex = 0;
  game.winStreak = 0;
  game.maxWinStreak = 0;
  game.defeated = 0;
  game.losses = 0;

  jankenTempo = 1200; // ★テンポも初期化

  speedLevel = 1;     // ★追加
  updateSpeed();     // ★追加
  updateStreak();   // ← ★④-5：リトライ時も0表示
  updateLives(); // ★追加

  document.getElementById("retryButton").style.display = "none";
  message.textContent = "クリックして開始";
  document.body.onclick = startJanken;
}


function updateStreak() {
  streakText.textContent = "現在の連勝：" + game.winStreak;
}

function updateSpeed() {
  if (!speedText) return;

  if (jankenTempo <= MIN_TEMPO) {
    speedText.textContent = "スピード Lv.MAX";
  } else {
    speedText.textContent = "スピード Lv." + speedLevel;
  }
}

function updateLives() {
  livesContainer.innerHTML = "";

  for (let i = 0; i < MAX_LIVES; i++) {
    const img = document.createElement("img");
    img.className = "life-heart";

    // 右から黒くする
    if (i >= MAX_LIVES - game.losses) {
      img.src = "heart_black.png";
    } else {
      img.src = "heart.png";
    }

    livesContainer.appendChild(img);
  }
}


updateStreak();
updateSpeed();
updateLives();