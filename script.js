const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('#year').textContent = new Date().getFullYear();

// Category selection also announces the updated result count to screen readers.
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector('#filter-status').textContent = `${count} proje gösteriliyor.`;
  });
});

const projects = {
  orbit: ['Orbit Data', 'Farklı kaynaklardan gelen örnek verileri tek bir analiz hattında toplama fikri.', 'Pandas ile eksik verileri temizle, NumPy ile dönüşümleri uygula, Matplotlib ile sonuçları görselleştir. İşlenen veriyi PostgreSQL üzerinde tut ve buluta aktarımı küçük, tekrar çalıştırılabilir adımlarla tasarla.'],
  mission: ['Mission: Solve', 'FLL benzeri bir görev parkurunda robotun tutarlı kararlar verebilmesine odaklanan bir konsept.', 'Görevleri küçük bloklara ayır; çizgi izleme, sensör kontrolü ve dönüş hareketleri için yeniden kullanılabilir bloklar kur. Hata payını parkur denemeleriyle ölç ve görev sıralamasını buna göre iyileştir.'],
  focus: ['Focus Workspace', 'Görevleri ve odak oturumlarını tek ekranda düzenleyen sade bir uygulama fikri.', 'HTML, CSS ve JavaScript ile erişilebilir bir arayüz oluştur. C# servis katmanında görevlerin durumlarını yönet; veritabanında tutarlı ve küçük bir görev modeli kullan.'],
  path: ['Path / Lab', 'Graf üzerinde arama yöntemlerini adım adım karşılaştırmayı amaçlayan bir algoritma laboratuvarı fikri.', 'C++ ile komşuluk listelerini ve BFS / Dijkstra algoritmalarını kur. Farklı graf örneklerinde ziyaret edilen düğümleri kaydet, Python ile sonuçları karşılaştır ve yolları web üzerinde görselleştir.']
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const [title, description, plan] = projects[button.dataset.project];
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#dialog-description').textContent = description;
    document.querySelector('#dialog-plan').textContent = plan;
    dialog.showModal();
  });
});
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

// A real breadth-first search on a four-neighbor, equally weighted grid.
const COLS = 16;
const ROWS = 9;
const START = COLS * 6 + 1;
const GOAL = COLS * 2 + 14;
const grid = document.querySelector('#grid');
const status = document.querySelector('#path-status');
let animationTimers = [];
let currentResult;
let currentCells = [];

function breadthFirstSearch(walls) {
  const queue = [START];
  const parents = new Map([[START, null]]);
  const visited = [];
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    visited.push(cell);
    if (cell === GOAL) {
      const path = [];
      for (let node = GOAL; node !== null; node = parents.get(node)) path.push(node);
      return { path: path.reverse(), visited };
    }
    const row = Math.floor(cell / COLS);
    const col = cell % COLS;
    for (const [dr, dc] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS) continue;
      const neighbor = nextRow * COLS + nextCol;
      if (!walls.has(neighbor) && !parents.has(neighbor)) {
        parents.set(neighbor, cell);
        queue.push(neighbor);
      }
    }
  }
  return null;
}

function cancelAnimation() {
  animationTimers.forEach(clearTimeout);
  animationTimers = [];
}

function showFinalPath() {
  if (!currentResult) return;
  cancelAnimation();
  currentResult.visited.forEach(index => currentCells[index].classList.add('visited'));
  currentResult.path.forEach(index => currentCells[index].classList.add('path'));
  status.textContent = `${currentResult.path.length - 1} adım · ${currentResult.visited.length} hücre keşfedildi`;
}

function drawPath(animate = true) {
  cancelAnimation();
  let walls;
  let result;
  for (let attempt = 0; attempt < 30 && !result; attempt++) {
    walls = new Set();
    for (let index = 0; index < COLS * ROWS; index++) {
      if (index !== START && index !== GOAL && Math.random() < .23) walls.add(index);
    }
    result = breadthFirstSearch(walls);
  }
  // Guaranteed reachable fallback if all randomly generated maps are blocked.
  if (!result) {
    walls = new Set();
    result = breadthFirstSearch(walls);
  }
  currentResult = result;
  currentCells = Array.from({ length: COLS * ROWS }, (_, index) => {
    const cell = document.createElement('span');
    cell.className = 'cell';
    if (walls.has(index)) cell.classList.add('wall');
    if (index === START) cell.classList.add('start');
    if (index === GOAL) cell.classList.add('goal');
    return cell;
  });
  grid.replaceChildren(...currentCells);
  status.textContent = 'Başlangıçtan hedefe rota aranıyor…';
  if (reducedMotion.matches || !animate) {
    showFinalPath();
    return;
  }
  result.visited.forEach((index, step) => {
    animationTimers.push(setTimeout(() => currentCells[index].classList.add('visited'), step * 13));
  });
  result.path.forEach((index, step) => {
    animationTimers.push(setTimeout(() => currentCells[index].classList.add('path'), result.visited.length * 13 + step * 32));
  });
  animationTimers.push(setTimeout(showFinalPath, result.visited.length * 13 + result.path.length * 32));
}

// Reserve and populate the grid before it scrolls into view.
drawPath(false);
let labStarted = false;
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !labStarted) {
      labStarted = true;
      drawPath();
      observer.disconnect();
    }
  }, { threshold: .2 });
  observer.observe(grid);
} else {
  labStarted = true;
  drawPath();
}
document.querySelector('#rerun').addEventListener('click', () => {
  labStarted = true;
  drawPath();
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) showFinalPath();
});
