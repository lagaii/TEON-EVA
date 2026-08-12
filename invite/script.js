// ============================================================
// НАСТРОЙКИ — редактируй здесь
// ============================================================
const CONFIG = {
  // Возраст / подпись под именами (например "5 лет" или "5-й день рождения")
  AGE_TEXT: "Заполните возраст",

  // Дата и время события
  EVENT_DATE: new Date(2026, 8, 5, 17, 0), // месяц с 0: 8 = сентябрь

  // Гости и их персональные ссылки: сайт.../?guest=slug
  GUESTS: {
    slava:   "Слава",
    oksana:  "Оксана",
    evgenia: "Евгения",
  },

  // Вставь сюда URL своего Google Apps Script Web App (см. README.md)
  RSVP_ENDPOINT: "",
};

// ============================================================
// Лепестки
// ============================================================
(function initPetals(){
  const container = document.getElementById('petals');
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++){
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = 8 + Math.random() * 12;
    petal.style.left = Math.random() * 100 + '%';
    petal.style.width = size + 'px';
    petal.style.height = (size * 1.15) + 'px';
    petal.style.setProperty('--sway', (Math.random() * 50 - 25) + 'px');
    petal.style.animationDuration = (10 + Math.random() * 8) + 's';
    petal.style.animationDelay = (Math.random() * -18) + 's';

    const inner = document.createElement('span');
    inner.className = 'petal-inner';
    inner.style.background = Math.random() > .5
      ? 'linear-gradient(160deg,#fbe6ed,#efa9bf)'
      : 'linear-gradient(160deg,#fff5f7,#f2b6c6)';
    inner.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
    petal.appendChild(inner);
    container.appendChild(petal);
  }
})();

// ============================================================
// Reveal on scroll
// ============================================================
(function initReveal(){
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();

// ============================================================
// Заголовок / дата / возраст
// ============================================================
(function fillHeader(){
  document.getElementById('hero-age').textContent = CONFIG.AGE_TEXT;
  const d = CONFIG.EVENT_DATE;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  document.getElementById('hero-date').textContent = `${dd}.${mm}.${d.getFullYear()}`;

  const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  document.getElementById('date-month').textContent = months[d.getMonth()];
  document.getElementById('date-day').textContent = d.getDate();
  document.querySelector('.dw-year').textContent = d.getFullYear();
  document.querySelector('.dw-time').textContent =
    String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
})();

// ============================================================
// Календарь месяца
// ============================================================
(function buildCalendar(){
  const d = CONFIG.EVENT_DATE;
  const year = d.getFullYear(), month = d.getMonth(), today = d.getDate();
  const weekdayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

  const wkEl = document.getElementById('cal-weekdays');
  weekdayNames.forEach(w => {
    const span = document.createElement('span');
    span.textContent = w;
    wkEl.appendChild(span);
  });

  const gridEl = document.getElementById('cal-grid');
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++){
    gridEl.appendChild(document.createElement('div'));
  }
  for (let day = 1; day <= daysInMonth; day++){
    const cell = document.createElement('div');
    const num = document.createElement('span');
    num.className = 'cal-num' + (day === today ? ' cal-today' : '');
    num.textContent = day;
    cell.appendChild(num);
    gridEl.appendChild(cell);
  }
})();

// ============================================================
// Музыка
// ============================================================
(function initMusic(){
  const btn = document.getElementById('music-btn');
  const audio = document.getElementById('bg-music');
  btn.addEventListener('click', () => {
    if (audio.paused){
      audio.play().catch(() => {});
      btn.classList.add('playing');
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });
})();

// ============================================================
// RSVP кнопка-скролл
// ============================================================
document.getElementById('cta-rsvp').addEventListener('click', () => {
  document.getElementById('rsvp-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ============================================================
// RSVP: персональная ссылка + сохранение в Google Sheets
// ============================================================
(function initRSVP(){
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('guest');
  const guestName = slug ? CONFIG.GUESTS[slug] : null;

  const loadingEl = document.getElementById('rsvp-loading');
  const controlsEl = document.getElementById('rsvp-controls');
  const noGuestEl = document.getElementById('rsvp-no-guest');
  const greetingEl = document.getElementById('rsvp-greeting');
  const alreadyEl = document.getElementById('rsvp-already');
  const errorEl = document.getElementById('rsvp-error');
  const confirmEl = document.getElementById('confirmation');
  const confirmMsgEl = document.getElementById('confirmation-message');

  if (!guestName){
    noGuestEl.hidden = false;
    return;
  }

  greetingEl.textContent = `Здравствуйте, ${guestName}!`;

  async function fetchExistingAnswer(){
    if (!CONFIG.RSVP_ENDPOINT) return null;
    try {
      const res = await fetch(`${CONFIG.RSVP_ENDPOINT}?guest=${encodeURIComponent(slug)}`);
      const data = await res.json();
      return data.answer || null;
    } catch (e){
      return null;
    }
  }

  async function sendAnswer(value){
    if (!CONFIG.RSVP_ENDPOINT) return true;
    try {
      await fetch(CONFIG.RSVP_ENDPOINT, {
        method: 'POST',
        // text/plain избегает CORS preflight, который Apps Script не поддерживает
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ guest: slug, name: guestName, answer: value }),
      });
      return true;
    } catch (e){
      return false;
    }
  }

  function showConfirmation(value){
    controlsEl.hidden = true;
    confirmEl.hidden = false;
    confirmMsgEl.textContent = value === 'yes'
      ? `Спасибо, ${guestName}! Ждём вас с нетерпением 🎉`
      : `Спасибо, ${guestName}, что дали знать. Будем скучать!`;
  }

  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      errorEl.hidden = true;
      btn.disabled = true;
      const value = btn.dataset.value;
      const ok = await sendAnswer(value);
      btn.disabled = false;
      if (ok){
        showConfirmation(value);
      } else {
        errorEl.hidden = false;
      }
    });
  });

  fetchExistingAnswer().then(existing => {
    loadingEl.hidden = true;
    controlsEl.hidden = false;
    if (existing){
      alreadyEl.hidden = false;
      alreadyEl.textContent = existing === 'yes'
        ? 'Вы уже подтвердили присутствие. Ответ можно изменить:'
        : 'Вы уже отметили, что не сможете прийти. Ответ можно изменить:';
    }
  });
})();
