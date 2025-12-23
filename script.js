// Color picker event listeners
const themeColorInput = document.getElementById('themeColor');
const bgColorInput = document.getElementById('bgColor');
const colorValue = document.getElementById('colorValue');
const bgColorValue = document.getElementById('bgColorValue');

themeColorInput.addEventListener('change', () => {
  colorValue.textContent = themeColorInput.value;
});

bgColorInput.addEventListener('change', () => {
  bgColorValue.textContent = bgColorInput.value;
});

// Form submission
const boardForm = document.getElementById('boardForm');
boardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  generateVisionBoard();
});

function generateVisionBoard() {
  const title = document.getElementById('title').value.trim();
  const goalsText = document.getElementById('goals').value.trim();
  const themeColor = document.getElementById('themeColor').value;
  const bgColor = document.getElementById('bgColor').value;
  const imageUrl = document.getElementById('imageUrl').value.trim();
  const affirmation = document.getElementById('affirmation').value.trim();

  if (!title || !goalsText) {
    alert('Please fill in the board title and goals!');
    return;
  }

  // Parse goals
  const goals = goalsText
    .split('\n')
    .map(g => g.trim())
    .filter(g => g.length > 0);

  // Create vision board HTML
  const visionBoard = document.getElementById('visionBoard');
  visionBoard.style.backgroundColor = bgColor;
  visionBoard.style.color = themeColor;

  if (imageUrl) {
    visionBoard.style.backgroundImage = `url('${imageUrl}')`;
  }

  // Build the vision board content
  let html = `<div class="vision-board-title" style="color: ${themeColor};">${escapeHtml(title)}</div>`;

  html += '<div class="vision-board-goals">';
  html += '<h3 style="color: ' + themeColor + ';">Goals</h3>';
  html += '<ul>';
  goals.forEach(goal => {
    html += `<li style="color: ${themeColor};">• ${escapeHtml(goal)}</li>`;
  });
  html += '</ul></div>';

  if (affirmation) {
    html += `<div class="vision-board-affirmation" style="color: ${themeColor}; background-color: rgba(255, 255, 255, 0.2); border: 2px solid ${themeColor};">“${escapeHtml(affirmation)}”</div>`;
  }

  visionBoard.innerHTML = html;

  // Show download buttons
  document.getElementById('downloadOptions').style.display = 'flex';
}

function downloadBoard(format) {
  const visionBoard = document.getElementById('visionBoard');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions
  const width = visionBoard.offsetWidth;
  const height = visionBoard.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  // Draw background
  const bgColor = document.getElementById('bgColor').value;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Draw background image if exists
  const imageUrl = document.getElementById('imageUrl').value.trim();
  if (imageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, width, height);
      drawCanvasContent(ctx, width, height);
      downloadCanvasAs(canvas, format);
    };
    img.onerror = () => {
      // If image fails to load, just draw text
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(0, 0, width, height);
      drawCanvasContent(ctx, width, height);
      downloadCanvasAs(canvas, format);
    };
    img.src = imageUrl;
  } else {
    // Draw overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, width, height);
    drawCanvasContent(ctx, width, height);
    downloadCanvasAs(canvas, format);
  }
}

function drawCanvasContent(ctx, width, height) {
  const themeColor = document.getElementById('themeColor').value;
  const title = document.getElementById('title').value;
  const goalsText = document.getElementById('goals').value;
  const affirmation = document.getElementById('affirmation').value;

  const goals = goalsText
    .split('\n')
    .map(g => g.trim())
    .filter(g => g.length > 0);

  // Set text color
  ctx.fillStyle = themeColor;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Draw title
  const titleY = 40;
  const words = title.split(' ');
  let line = '';
  let y = titleY;
  const maxWidth = width - 80;

  ctx.font = 'bold 40px Arial';
  words.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, width / 2, y);
      line = word + ' ';
      y += 50;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, width / 2, y);

  // Draw goals
  ctx.font = 'bold 20px Arial';
  y += 80;
  ctx.fillText('Goals', width / 2, y);
  y += 40;

  ctx.font = '16px Arial';
  goals.slice(0, 5).forEach(goal => {
    const goalText = '• ' + goal.substring(0, 40);
    ctx.fillText(goalText, width / 2, y);
    y += 30;
  });

  // Draw affirmation
  if (affirmation) {
    ctx.font = 'italic 18px Arial';
    y = height - 80;
    const affText = '“' + affirmation.substring(0, 50) + '...”';
    ctx.fillText(affText, width / 2, y);
  }
}

function downloadCanvasAs(canvas, format) {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  const title = document.getElementById('title').value.replace(/\s+/g, '_');

  if (format === 'png') {
    link.href = canvas.toDataURL('image/png');
    link.download = `vision-board-${title}-${timestamp}.png`;
  } else if (format === 'jpeg') {
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.download = `vision-board-${title}-${timestamp}.jpeg`;
  }

  link.click();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
