const grid = document.querySelector('#grid');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let timers = [];
function drawPath() {
  timers.forEach(clearTimeout);
  timers = [];
  grid.replaceChildren();
  const cells = Array.from({ length: 160 }, (_, index) => {
    const cell = document.createElement('span');
    cell.className = 'cell';
    if ((index * 17 + 7) % 13 < 3) cell.classList.add('wall');
    grid.append(cell);
    return cell;
  });
  let row = 6;
  const path = [];
  for (let col = 0; col < 16; col++) {
    path.push(row * 16 + col);
    if (col % 3 === 1) {
      row = Math.max(1, Math.min(8, row + (Math.random() > .45 ? -1 : 1)));
      path.push(row * 16 + col);
    }
  }
  path.forEach((index, step) => {
    const light = () => {
      cells[index].classList.remove('wall');
      cells[index].classList.add('path');
      if (step === 0 || step === path.length - 1) cells[index].classList.add('start');
    };
    if (reducedMotion.matches) light();
    else timers.push(setTimeout(light, 100 + step * 65));
  });
}
drawPath();
document.querySelector('#rerun').addEventListener('click', drawPath);
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-category]').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
  });
});
const projects = {
  orbit: ['Orbit Data', 'Farklı kaynaklardan gelen örnek verileri tek bir analiz hattında toplama fikri.', 'Pandas ile eksik verileri temizle, NumPy ile dönüşümleri uygula, Matplotlib ile sonuçları görselleştir. İşlenen veriyi PostgreSQL üzerinde tut ve buluta aktarımı küçük, tekrar çalıştırılabilir adımlarla tasarla.'],
  mission: ['Mission: Solve', 'FLL benzeri bir görev parkurunda robotun tutarlı kararlar verebilmesine odaklanan bir konsept.', 'Görevleri küçük bloklara ayır; çizgi izleme, sensör kontrolü ve dönüş hareketleri için yeniden kullanılabilir bloklar kur. Hata payını parkur denemeleriyle ölç ve görev sıralamasını buna göre iyileştir.'],
  focus: ['Focus Workspace', 'Görevleri ve odak oturumlarını tek ekranda düzenleyen sade bir uygulama fikri.', 'HTML, CSS ve JavaScript ile erişilebilir bir arayüz oluştur. C# servis katmanında görevlerin durumlarını yönet; veritabanında tutarlı ve küçük bir görev modeli kullan.'],
  path: ['Path / Lab', 'Graf üzerinde arama yöntemlerini adım adım karşılaştırmayı amaçlayan bir algoritma laboratuvarı fikri.', 'C++ ile komşuluk listelerini ve BFS / Dijkstra algoritmalarını kur. Farklı graf örneklerinde ziyaret edilen düğümleri kaydet, Python ile sonuçları karşılaştır ve yolları web üzerinde görselleştir.']
};
const dialog = document.querySelector('#project-dialog');
dialog.setAttribute('aria-labelledby', 'dialog-title');
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
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
