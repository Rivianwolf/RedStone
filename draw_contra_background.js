
let backgroundTime = 0;

function blendColors(c1, c2, t) {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

function drawContraBackground(scrollX) {
  backgroundTime += 0.002;
  const cycle = (Math.sin(backgroundTime) + 1) / 2;

  // Sky gradient with day/night cycle
  const dayTop = "#87CEEB";
  const dayBottom = "#F0F8FF";
  const nightTop = "#000814";
  const nightBottom = "#14213D";
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, blendColors(dayTop, nightTop, cycle));
  skyGradient.addColorStop(1, blendColors(dayBottom, nightBottom, cycle));
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun/Moon
  const celestialX = 150 - scrollX * 0.1;
  ctx.beginPath();
  ctx.arc(celestialX, 80, 40, 0, Math.PI * 2);
  ctx.fillStyle = cycle > 0.5 ? "#EAEAEA" : "#FFF799";
  ctx.fill();

  // Clouds
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < canvas.width + 200; i += 200) {
    const cloudX = i - (scrollX * 0.1 % 200) + backgroundTime * 20;
    ctx.beginPath();
    ctx.ellipse(cloudX, 120, 40, 20, 0, 0, Math.PI * 2);
    ctx.ellipse(cloudX + 30, 120, 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }


  // Mountains (far layer)
  ctx.fillStyle = "#202020";
  for (let i = 0; i < canvas.width + 300; i += 300) {
    const baseX = i - (scrollX * 0.2 % 300);
    ctx.beginPath();
    ctx.moveTo(baseX, canvas.height - 200);
    ctx.lineTo(baseX + 150, canvas.height - 300);
    ctx.lineTo(baseX + 300, canvas.height - 200);
    ctx.closePath();
    ctx.fill();
  }

  // Trees (mid layer)
  ctx.fillStyle = "#081C15";
  for (let i = 0; i < canvas.width + 100; i += 100) {
    const treeX = i - (scrollX * 0.5 % 100);
    ctx.fillRect(treeX, canvas.height - 160, 10, 60);
    ctx.beginPath();
    ctx.moveTo(treeX - 20, canvas.height - 160);
    ctx.lineTo(treeX + 5, canvas.height - 200);
    ctx.lineTo(treeX + 30, canvas.height - 160);
    ctx.fill();
  }

  // Foreground (ground)
  ctx.fillStyle = "#3A5A40";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  // Floor tiles
  ctx.fillStyle = "#6A994E";
  for (let i = 0; i < canvas.width + 50; i += 50) {
    const tileX = i - (scrollX % 50);
    ctx.fillRect(tileX, canvas.height - 40, 48, 8);
  }
}
