
(()=>{
/* ----------------- init ----------------- */
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const centerX = W/2, ropeY = 300;

let progress = 0;
let running = false;
let frame = 0;
let confetti = [];
let sparkles = [];
let winnerText = "";
let startTime = 0;

/* gambar pemain */
const imgLeft = new Image();
const imgRight = new Image();
imgLeft.src = "assets/game.png";
imgRight.src = "assets/game2.png";

const leftHandOffset = { x: 18, y: -58 };
const rightHandOffset = { x: -18, y: -58 };

const crowdSound = document.getElementById('crowdSound');


/* audio */
const cheer = document.getElementById('cheer');
const whistle = document.getElementById('whistle');

/* ====== AWAN ====== */
let clouds = Array.from({length:7},() => ({
  x: Math.random()*W,
  y: 30 + Math.random()*70,
  speed: 0.05 + Math.random()*0.2,
  scale: 0.6 + Math.random()*0.9
}));

function drawClouds(){
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  clouds.forEach(cl=>{
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, 60*cl.scale, 24*cl.scale, 0, 0, Math.PI*2);
    ctx.ellipse(cl.x+35*cl.scale, cl.y+5*cl.scale, 50*cl.scale, 20*cl.scale, 0, 0, Math.PI*2);
    ctx.ellipse(cl.x-35*cl.scale, cl.y+5*cl.scale, 50*cl.scale, 20*cl.scale, 0, 0, Math.PI*2);
    ctx.fill();
    cl.x += cl.speed;
    if(cl.x > W + 90) cl.x = -90;
  });
}

/* ====== BURUNG ====== */
let birds = Array.from({length:6}, ()=>spawnBird());
function spawnBird(){
  return {
    x: -50 - Math.random()*W,
    y: 40 + Math.random()*80,
    speed: 0.8 + Math.random()*0.6,
    size: 12 + Math.random()*8,
    flap: Math.random()*Math.PI*2
  };
}

function drawBirds(){
  birds.forEach(b=>{
    b.x += b.speed;
    b.flap += 0.2;
    if(b.x > W + 60){
      Object.assign(b, spawnBird());
    }
    // gambar burung sederhana (silhouette 'V')
    const wingY = Math.sin(b.flap)*3;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x - b.size/2, b.y + wingY);
    ctx.lineTo(b.x, b.y - wingY*1.5);
    ctx.lineTo(b.x + b.size/2, b.y + wingY);
    ctx.stroke();
  });
}

/* ====== Penonton ====== */
let crowd = Array.from({length:22},(_,i)=>({
  x: 30 + i*((W-60)/22),
  y: H*0.55 - 10 + Math.random()*8,
  color: ["#ff5252","#42a5f5","#66bb6a","#fdd835"][i%4],
  phase: Math.random()*Math.PI*2
}));

function drawCrowd(f){
  crowd.forEach(p=>{
    const bounce = Math.sin(f/12 + p.phase) * 4;
    ctx.fillStyle = "#ffe0bd";
    ctx.beginPath();
    ctx.arc(p.x, p.y-8 + bounce, 4.5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x-3, p.y-8 + bounce, 6, 12);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y-2 + bounce);
    ctx.lineTo(p.x + Math.sin(f/8 + p.phase)*6, p.y-6 + bounce);
    ctx.stroke();
  });
}

/* lampu panggung */
function drawFlagLights(){
  const hue = (frame % 360);
  const colors = [
    `hsla(${(hue)%360},100%,60%,0.25)`,
    `hsla(${(hue+90)%360},100%,60%,0.25)`,
    `hsla(${(hue+180)%360},100%,60%,0.25)`
  ];
  const positions = [W*0.22, W*0.5, W*0.78];
  positions.forEach((px, idx)=>{
    const r = 140 + 40*Math.sin((frame/60)+idx);
    const grad = ctx.createRadialGradient(px, H*0.28, 20, px, H*0.28, r);
    grad.addColorStop(0, colors[idx%colors.length]);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
  });
}

/* dekor lapangan */
function drawDecor(){
  const skyGrad = ctx.createLinearGradient(0,0,0,H*0.55);
  skyGrad.addColorStop(0,"#87CEFA");
  skyGrad.addColorStop(1,"#b3ecff");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0,0,W,H*0.55);

  const grassGrad = ctx.createLinearGradient(0,H*0.55,0,H);
  grassGrad.addColorStop(0,"#43a047");
  grassGrad.addColorStop(1,"#2e7d32");
  ctx.fillStyle = grassGrad;
  ctx.fillRect(0,H*0.55,W,H*0.45);

  for (let i=0;i<180;i++){
    ctx.fillStyle = `rgba(0,${120+Math.random()*80|0},0,0.18)`;
    ctx.fillRect(Math.random()*W, H*0.55 + Math.random()*H*0.45, 1.4, 1.4);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(36, H*0.55 + 10);
  ctx.lineTo(W-36, H*0.55 + 10);
  ctx.stroke();

  const poleCount = 5;
  const poleSpacing = W/(poleCount+1);
  const poleHeight = 150;
  for (let i=1;i<=poleCount;i++){
    const x = poleSpacing*i;
    const baseY = H*0.55;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY - poleHeight);
    ctx.stroke();
    const flagW = 40, flagH = 24;
    const topY = baseY - poleHeight;
    ctx.fillStyle = "red";
    ctx.fillRect(x+6, topY+2, flagW, flagH/2);
    ctx.fillStyle = "white";
    ctx.fillRect(x+6, topY + 2 + flagH/2, flagW, flagH/2);
  }

  for(let i=0;i<12;i++){
    ctx.fillStyle = i%2 ? "white" : "red";
    ctx.beginPath();
    ctx.moveTo(40 + i*70, 80);
    ctx.lineTo(70 + i*70, 80);
    ctx.lineTo(55 + i*70, 110);
    ctx.closePath();
    ctx.fill();
  }

  drawFlagLights();
}

/* bayangan */
function drawShadow(x,y){
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y-6, 30, 10, 0, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}

/* overlay pemenang */
function showWinner(text){
  ctx.save();
  ctx.fillStyle="rgba(0,0,0,0.6)";
  ctx.fillRect(W*0.2,40,W*0.6,70);
  ctx.fillStyle="#fff";
  ctx.font="bold 28px Arial";
  ctx.textAlign="center";
  ctx.fillText(text, W/2, 82);
  ctx.restore();
}

/* sparkle */
function drawSparkles(){
  sparkles.forEach(s=>{
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fill();
    s.y += s.vy;
    s.a -= 0.01;
  });
  sparkles = sparkles.filter(s=> s.a>0);
}

/* main loop */
function draw(){
  frame++;
  ctx.clearRect(0,0,W,H);

  // langit & obyek udara
  drawDecor();
  drawClouds();
  drawBirds();   // <-- burung
  drawCrowd(frame);

  const leftBase = { x: 200 + progress*0.25, y: H*0.6 };
  const rightBase = { x: 700 + progress*0.25, y: H*0.6 };
  const csW = 96, csH = 128;

  drawShadow(leftBase.x, leftBase.y);
  drawShadow(rightBase.x, rightBase.y);

  if(imgLeft.complete)  ctx.drawImage(imgLeft, leftBase.x-csW/2, leftBase.y-csH, csW, csH);
  if(imgRight.complete) ctx.drawImage(imgRight, rightBase.x-csW/2, rightBase.y-csH, csW, csH);

  // tali
  const lx = leftBase.x + leftHandOffset.x;
  const ly = leftBase.y + leftHandOffset.y;
  const rx = rightBase.x + rightHandOffset.x;
  const ry = rightBase.y + rightHandOffset.y;
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#6b3f2b";
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  ctx.quadraticCurveTo((lx+rx)/2, ropeY-40 + Math.sin(frame/15)*5, rx, ry);
  ctx.stroke();

  // penanda tengah
  ctx.fillStyle = "white";
  ctx.fillRect(centerX + progress - 10, ropeY-20, 20, 20);
  ctx.fillStyle = "red";
  ctx.fillRect(centerX + progress - 10, ropeY-20, 20, 10);

  // confetti
  confetti.forEach(c=>{
    ctx.fillStyle = c.c;
    ctx.fillRect(c.x, c.y, 4, 4);
    c.y += c.vy;
    if(c.y > H) c.y = -10;
  });

  drawSparkles();

  if(progress > 200 && running) endGame("SELAMAT! Tim Kanan Menang");
  if(progress < -200 && running) endGame("SELAMAT! Tim Kiri Menang");

  if(winnerText) showWinner(winnerText);

  const pbar = document.getElementById('progressBar');
  if(pbar) pbar.style.width = (50 + (progress/200)*50) + '%';

  requestAnimationFrame(draw);
}

/* controls */
function pressLeft(){ if(running) progress -= 10; }
function pressRight(){ if(running) progress += 10; }

function resetGame(){
  progress = 0;
  running = true;
  winnerText = "";
  confetti = [];
  sparkles = [];
  startTime = performance.now();
  document.getElementById('progressBar').style.width = '50%';
  try { whistle.play(); } catch(e){}
}

function start(){
  document.getElementById('startScreen')?.style.setProperty("display","none");
  resetGame();
}

function endGame(text){
  running = false;
  winnerText = text;
  spawnConfetti();
  spawnSparkles();
  try { cheer.play(); } catch(e){}
  const time = ((performance.now() - startTime)/1000).toFixed(2);
  saveLeaderboard(text.includes("Kanan") ? "Tim Kanan" : "Tim Kiri", time);
}

/* confetti & sparkle */
function spawnConfetti(){
  for(let i=0;i<220;i++){
    confetti.push({
      x: Math.random()*W,
      y: Math.random()*H*0.5,
      c: ["red","white","#FFD700","blue","lime"][Math.floor(Math.random()*5)],
      vy: Math.random()*2+0.5
    });
  }
}
function spawnSparkles(){
  for(let i=0;i<80;i++){
    sparkles.push({
      x: Math.random()*W,
      y: Math.random()*H*0.4,
      r: Math.random()*2 + 1,
      vy: Math.random()*1.2 + 0.4,
      a: 1
    });
  }
}

/* leaderboard */
function saveLeaderboard(team, time){
  const today = new Date();
  const tgl = today.toLocaleDateString("id-ID", { day:"2-digit", month:"2-digit", year:"numeric" });
  let scores = JSON.parse(localStorage.getItem("tarikLeaderboard") || "[]");
  scores.push({ team, time: parseFloat(time), date: tgl });
  scores.sort((a,b)=> a.time - b.time);
  localStorage.setItem("tarikLeaderboard", JSON.stringify(scores.slice(0,10)));
  renderLeaderboard();
}

function renderLeaderboard(){
  let scores = JSON.parse(localStorage.getItem("tarikLeaderboard") || "[]");
  const body = document.getElementById("leaderBody");
  if(!body) return;
  body.innerHTML = "";
  scores.forEach((s,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${s.team}</td><td>${s.time}s</td><td>${s.date}</td>`;
    body.appendChild(tr);
  });
}

/* input */
window.addEventListener("keydown", e=>{
  if(e.key.toLowerCase() === "a") pressLeft();
  if(e.key.toLowerCase() === "l") pressRight();
  if(e.key.toLowerCase() === "r") resetGame();
  if(e.code === "Space" && !running) start();
});
document.getElementById("leftBtn")?.addEventListener("click", pressLeft);
document.getElementById("rightBtn")?.addEventListener("click", pressRight);
document.getElementById("resetBtn")?.addEventListener("click", resetGame);
document.getElementById("startBtn")?.addEventListener("click", start);
document.getElementById("clearBoard")?.addEventListener("click", ()=>{
  localStorage.removeItem("tarikLeaderboard");
  renderLeaderboard();
});

/* start loop */
renderLeaderboard();
requestAnimationFrame(draw);
})();
