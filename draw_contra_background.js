
function drawContraBackground(scrollX) {
  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, "#000814");
  skyGradient.addColorStop(1, "#14213D");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Moon (scrolls slowly)
  const moonX = 150 - scrollX * 0.1;
  ctx.beginPath();
  ctx.arc(moonX, 80, 40, 0, Math.PI * 2);
  ctx.fillStyle = "#EAEAEA";
  ctx.fill();

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
