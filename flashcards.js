const charEl = document.getElementById('character');
const progressEl = document.getElementById('progress');
const messageEl = document.getElementById('message');
const hintEl = document.getElementById('hint');
const fileListEl = document.getElementById('file-list');
const startBtn = document.getElementById('start-btn');
const mainEl = document.getElementById('main');
const sidebarToggle = document.getElementById('sidebar-toggle');

sidebarToggle.addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  sidebarToggle.innerHTML = collapsed ? '&#8250;' : '&#8249;';
});

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let queue = [];
let history = [];
let allChars = [];
let shown = 0;
let running = false;

function showChar(ch) {
  charEl.textContent = ch;
  progressEl.textContent = `${shown} / ${allChars.length}`;
}

function nextChar() {
  if (queue.length === 0) return;
  const ch = queue.pop();
  shown++;
  history.push(ch);
  showChar(ch);
}

function prevChar() {
  if (history.length <= 1) return; // nothing to go back to
  // put current card back on queue
  queue.push(history.pop());
  shown--;
  showChar(history[history.length - 1]);
}

function transition(fn) {
  if (!running) return;
  charEl.classList.add('fade');
  setTimeout(() => {
    fn();
    charEl.classList.remove('fade');
  }, 150);
}

function advance() {
  if (queue.length === 0) return;
  transition(nextChar);
}

function goBack() {
  if (history.length <= 1) return;
  transition(prevChar);
}

function checkedFiles() {
  return [...fileListEl.querySelectorAll('input[type="checkbox"]:checked')]
    .map(cb => cb.value);
}

function updateStartBtn() {
  startBtn.disabled = checkedFiles().length === 0;
}

async function loadFiles(filenames) {
  const texts = await Promise.all(
    filenames.map(name =>
      fetch(`assets/${name}`).then(r => {
        if (!r.ok) throw new Error(`Failed to load ${name}`);
        return r.text();
      })
    )
  );
  const combined = texts.join('');
  const chars = [...combined.matchAll(/[\u4e00-\u9fff\u3400-\u4dbf]/g)].map(m => m[0]);
  return [...new Set(chars)];
}

async function startSession() {
  const files = checkedFiles();
  if (files.length === 0) return;

  startBtn.disabled = true;
  messageEl.textContent = 'Loading…';
  charEl.textContent = '';
  progressEl.textContent = '';
  hintEl.textContent = '';
  running = false;

  try {
    allChars = await loadFiles(files);
  } catch (e) {
    messageEl.textContent = e.message;
    startBtn.disabled = false;
    return;
  }

  if (allChars.length === 0) {
    messageEl.textContent = 'No Chinese characters found in selected files.';
    startBtn.disabled = false;
    return;
  }

  queue = shuffle([...allChars]);
  history = [];
  shown = 0;
  running = true;
  messageEl.textContent = '';
  hintEl.textContent = 'Click, Space, or PageDown to advance · PageUp to go back';
  nextChar();
  startBtn.disabled = false;
}

// Discover .txt files from static manifest (required for GitHub Pages)
fetch('assets/index.json')
  .then(r => r.json())
  .then(manifest => {
    const files = manifest.files;
    const defaults = new Set(manifest.default || []);
    files.forEach(name => {
      const item = document.createElement('div');
      item.className = 'file-item';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = `file-${name}`;
      cb.value = name;
      cb.checked = defaults.has(name);
      cb.addEventListener('change', updateStartBtn);

      const label = document.createElement('label');
      label.htmlFor = `file-${name}`;
      label.textContent = decodeURIComponent(name).replace(/\.txt$/, '');

      item.appendChild(cb);
      item.appendChild(label);
      // clicking the row toggles the checkbox
      item.addEventListener('click', e => {
        if (e.target !== cb && e.target !== label) cb.click();
      });

      fileListEl.appendChild(item);
    });
    updateStartBtn();
    if (defaults.size > 0) startSession();
  })
  .catch(() => {
    fileListEl.textContent = 'Failed to load file list.';
  });

startBtn.addEventListener('click', startSession);
mainEl.addEventListener('click', advance);

document.addEventListener('keydown', e => {
  if (e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); advance(); }
  if (e.key === 'PageUp')   { e.preventDefault(); goBack(); }
});

mainEl.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.deltaY > 0) advance(); else goBack();
}, { passive: false });
