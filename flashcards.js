const charEl = document.getElementById('character');
const progressEl = document.getElementById('progress');
const messageEl = document.getElementById('message');

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let queue = [];
let allChars = [];
let shown = 0;

function nextChar() {
  if (queue.length === 0) {
    queue = shuffle([...allChars]);
    shown = 0;
  }
  const ch = queue.pop();
  shown++;
  charEl.textContent = ch;
  progressEl.textContent = `${shown} / ${allChars.length}`;
}

function advance() {
  charEl.classList.add('fade');
  setTimeout(() => {
    nextChar();
    charEl.classList.remove('fade');
  }, 150);
}

fetch('assets/grade1b.txt')
  .then(r => r.text())
  .then(text => {
    // Extract CJK Unified Ideographs (common Chinese characters)
    const chars = [...text.matchAll(/[\u4e00-\u9fff\u3400-\u4dbf]/g)].map(m => m[0]);
    const unique = [...new Set(chars)];

    if (unique.length === 0) {
      messageEl.textContent = 'No Chinese characters found.';
      return;
    }

    allChars = unique;
    queue = shuffle([...allChars]);
    nextChar();

    document.body.addEventListener('click', advance);
  })
  .catch(() => {
    messageEl.textContent = 'Failed to load grade1b.txt';
  });
