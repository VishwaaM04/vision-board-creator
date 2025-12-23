const categoryKeywords = {
    'Food & Supplements': 'healthy food nutrition',
    'Inner Peace': 'meditation yoga relaxation',
    'Workout': 'fitness gym training',
    'Family': 'family happiness love',
    'Friends': 'friendship adventure travel',
    'Relationship': 'love couple romance',
    'Skin & Hair': 'beauty skincare',
    'Hobbies': 'creativity hobby art',
    'Materialistic': 'luxury wealth gold',
    'Self Improvement': 'growth learning development',
    'Places to Travel': 'travel adventure world',
    'Educational Stuff': 'education learning success',
    'Money': 'wealth finance success'
};

async function fetchImage(query) {
    const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(query)}`;
    return imageUrl;
}

function parseVisionInput(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const categories = [];
    let currentCategory = null;
    let currentGoals = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        if (i + 1 < lines.length && lines[i + 1].includes(',')) {
            if (currentCategory) {
                categories.push({ name: currentCategory, goals: currentGoals });
            }
            currentCategory = line;
            currentGoals = [];
        } else if (currentCategory && line.includes(',')) {
            currentGoals = line.split(',').map(g => g.trim());
        } else if (currentCategory && !line.includes(',')) {
            currentGoals.push(line);
        } else if (!currentCategory) {
            currentCategory = line;
        }
    }
    if (currentCategory) {
        categories.push({ name: currentCategory, goals: currentGoals });
    }
    return categories;
}

async function generateBoard() {
    const title = document.getElementById('boardTitle').value.trim();
    const goalsText = document.getElementById('visionGoals').value.trim();
    const messageDiv = document.getElementById('message');

    if (!title || !goalsText) {
        messageDiv.innerHTML = 'Please enter both title and goals!';
        messageDiv.className = 'message error';
        return;
    }

    messageDiv.innerHTML = 'Generating your vision board...';
    messageDiv.className = 'message';

    try {
        const categories = parseVisionInput(goalsText);
        if (categories.length === 0) {
            messageDiv.innerHTML = 'No valid categories found!';
            messageDiv.className = 'message error';
            return;
        }

        const categoryPromises = categories.map(async (cat) => {
            const keyword = categoryKeywords[cat.name] || cat.name;
            const imageUrl = await fetchImage(keyword);
            return { ...cat, image: imageUrl };
        });

        const categoriesWithImages = await Promise.all(categoryPromises);
        displayBoard(title, categoriesWithImages);
        messageDiv.innerHTML = 'Vision board created successfully!';
        messageDiv.className = 'message success';
    } catch (error) {
        messageDiv.innerHTML = 'Error generating board. Please try again.';
        messageDiv.className = 'message error';
    }
}

function displayBoard(title, categories) {
    const boardContainer = document.getElementById('boardContainer');
    const boardTitle = boardContainer.querySelector('.board-title');
    const categoriesGrid = document.getElementById('categoriesGrid');

    boardTitle.textContent = title.toUpperCase();
    
    let boardHTML = '';
    const columnsPerRow = 2;
    
    for (let i = 0; i < categories.length; i += columnsPerRow) {
        boardHTML += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-bottom: 25px;">';
        for (let j = 0; j < columnsPerRow && i + j < categories.length; j++) {
            const category = categories[i + j];
            boardHTML += `<div class="category-card">
                <img src="${category.image}" alt="${category.name}" class="category-image" />
                <div class="category-content">
                    <h3 class="category-name">${category.name}</h3>
                    <div class="category-goals">
                        ${category.goals.map(goal => `<div class="goal-item">${goal}</div>`).join('')}
                    </div>
                </div>
            </div>`;
        }
        boardHTML += '</div>';
    }
    
    categoriesGrid.innerHTML = boardHTML;
    boardContainer.style.display = 'block';
    boardContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadBoard() {
    const boardContainer = document.getElementById('boardContainer');
    if (!boardContainer || boardContainer.style.display === 'none') {
        alert('Please generate a board first!');
        return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => {
        html2canvas(boardContainer, {
            backgroundColor: '#0a0e27',
            scale: 2,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'vision-board-' + new Date().getTime() + '.png';
            link.click();
        }).catch(err => {
            alert('Error downloading board. Please try again.');
        });
    };
    document.head.appendChild(script);
}

function shareBoard() {
    const title = document.getElementById('boardTitle').value;
    const shareText = `Check out my 2025 Vision Board: ${title}`;
    if (navigator.share) {
        navigator.share({ title: title, text: shareText });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Shared text copied to clipboard!');
        });
    }
}

function clearAll() {
    if (confirm('Are you sure you want to clear everything?')) {
        document.getElementById('boardTitle').value = '';
        document.getElementById('visionGoals').value = '';
        document.getElementById('message').innerHTML = '';
        document.getElementById('boardContainer').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Vision Board Creator v2.0 Loaded');
});
