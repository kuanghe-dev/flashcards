const charEl = document.getElementById('character');
const progressEl = document.getElementById('progress');
const messageEl = document.getElementById('message');
const hintEl = document.getElementById('hint');
const fileListEl = document.getElementById('file-list');
const startBtn = document.getElementById('start-btn');
const mainEl = document.getElementById('main');
const sidebarToggle = document.getElementById('sidebar-toggle');
const customInputEl = document.getElementById('custom-input');

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
    .filter(cb => cb.id !== 'custom-input-cb')
    .map(cb => cb.value);
}

function customInputChars() {
  const cb = document.getElementById('custom-input-cb');
  if (!cb || !cb.checked) return [];
  return [...customInputEl.value.matchAll(/[\u4e00-\u9fff\u3400-\u4dbf]/g)].map(m => m[0]);
}

function appendCustomInputItem() {
  const item = document.createElement('div');
  item.className = 'file-item';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = 'custom-input-cb';

  const label = document.createElement('label');
  label.htmlFor = 'custom-input-cb';
  label.textContent = 'Custom Input';

  item.appendChild(cb);
  item.appendChild(label);
  item.addEventListener('click', e => {
    if (e.target !== cb && e.target !== label) cb.click();
  });
  cb.addEventListener('change', () => {
    customInputEl.classList.toggle('active', cb.checked);
    updateStartBtn();
  });

  fileListEl.appendChild(item);
  fileListEl.appendChild(customInputEl);
}

function updateStartBtn() {
  startBtn.disabled = checkedFiles().length === 0 && customInputChars().length === 0;
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
  const combined = texts.map(t => t.split('\n').filter(l => !l.startsWith('#')).join('\n')).join('');
  const chars = [...combined.matchAll(/[\u4e00-\u9fff\u3400-\u4dbf]/g)].map(m => m[0]);
  return [...new Set(chars)];
}

async function startSession() {
  const files = checkedFiles();
  const custom = customInputChars();
  if (files.length === 0 && custom.length === 0) return;

  startBtn.disabled = true;
  messageEl.textContent = 'Loading…';
  charEl.textContent = '';
  progressEl.textContent = '';
  hintEl.textContent = '';
  running = false;

  let fileChars = [];
  try {
    if (files.length > 0) fileChars = await loadFiles(files);
  } catch (e) {
    messageEl.textContent = e.message;
    startBtn.disabled = false;
    return;
  }
  allChars = [...new Set([...fileChars, ...custom])];

  if (allChars.length === 0) {
    messageEl.textContent = 'No Chinese characters found.';
    startBtn.disabled = false;
    return;
  }

  queue = shuffle([...allChars]);
  history = [];
  shown = 0;
  running = true;
  messageEl.textContent = '';
  hintEl.textContent = 'Click or ↓/→ to advance · ↑/← to go back · swipe ←/→ on touch';
  nextChar();
  if (navigator.maxTouchPoints > 0) {
    document.body.classList.add('sidebar-collapsed');
    sidebarToggle.innerHTML = '&#8250;';
  }
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
    appendCustomInputItem();
    updateStartBtn();
    if (defaults.size > 0) startSession();
  })
  .catch(() => {
    fileListEl.textContent = 'Failed to load file list.';
    appendCustomInputItem();
    updateStartBtn();
  });

customInputEl.addEventListener('input', updateStartBtn);
customInputEl.addEventListener('compositionend', updateStartBtn);
customInputEl.addEventListener('paste', () => setTimeout(updateStartBtn, 0));
customInputEl.addEventListener('keydown', e => e.stopPropagation());

startBtn.addEventListener('click', startSession);
mainEl.addEventListener('click', advance);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
  if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); goBack(); }
});

mainEl.addEventListener('wheel', e => {
  e.preventDefault();
  if (e.deltaY > 0) advance(); else goBack();
}, { passive: false });

let touchStartX = null;
mainEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
mainEl.addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(dx) < 40) return; // too short, treat as tap
  if (dx > 0) goBack(); else advance();
}, { passive: true });
