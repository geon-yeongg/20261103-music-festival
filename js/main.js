/* ============================================================
   FREQ! 메인 페이지 인터랙션
   기능 1: 모바일 메뉴 토글
   기능 2: 아티스트 날짜 필터
   기능 3: 공연 일정 날짜 탭 및 전체 일정 팝업
   기능 4: 전체 프로그램 팝업
   외부 라이브러리 / 서버 요청 없이 동작합니다.
   ============================================================ */

// 샘플 행사 일정 데이터: 실제 존재하는 공연 정보가 아닌 가상 설정입니다.
const festivalSchedule = {
  sat: [
    { time: '13:00', name: '게이트 오픈', genre: 'OPEN / 입장 시작', stage: 'ENTRANCE' },
    { time: '14:00', name: 'FREQ! DJ 오프닝', genre: 'OPENING DJ SET', stage: 'MAIN STAGE' },
    { time: '15:30', name: '새벽도시', genre: 'DREAM POP', stage: 'MAIN STAGE' },
    { time: '17:20', name: '네온레인', genre: 'SYNTH POP', stage: 'MAIN STAGE' },
    { time: '19:40', name: '파도상점', genre: 'INDIE ROCK', stage: 'MAIN STAGE' },
    { time: '21:00', name: 'DAY 01 종료', genre: 'SEE YOU TOMORROW!', stage: 'MAIN STAGE' },
  ],
  sun: [
    { time: '13:00', name: '게이트 오픈', genre: 'OPEN / 입장 시작', stage: 'ENTRANCE' },
    { time: '14:00', name: 'FREQ! DJ 오프닝', genre: 'OPENING DJ SET', stage: 'MAIN STAGE' },
    { time: '15:30', name: '모래정원', genre: 'FOLK ROCK', stage: 'MAIN STAGE' },
    { time: '17:20', name: '오프화이트', genre: 'ACOUSTIC', stage: 'MAIN STAGE' },
    { time: '19:40', name: '고양이 우주선', genre: 'ALT ROCK', stage: 'MAIN STAGE' },
    { time: '21:00', name: '페스티벌 종료', genre: 'THANK YOU & GOOD NIGHT', stage: 'MAIN STAGE' },
  ],
};

// 모든 표시 텍스트는 이 파일에 적힌 고정 데이터에서 생성됩니다.
// 외부 입력을 innerHTML에 섞지 않아 XSS 위험을 줄였습니다.
function renderScheduleDay(day) {
  const container = document.getElementById('schedulePreview');
  if (!container || !festivalSchedule[day]) return;
  container.replaceChildren();
  // 미리보기는 대표 공연 세 개만 보여줍니다.
  const preview = festivalSchedule[day].filter(item => !item.genre.includes('OPEN') && !item.name.includes('종료'));
  preview.forEach(item => {
    const row = document.createElement('div');
    row.className = 'schedule-row';
    const time = document.createElement('time');
    time.className = 'schedule-time'; time.textContent = item.time;
    const middle = document.createElement('div'); middle.className = 'schedule-main';
    const artist = document.createElement('strong'); artist.textContent = item.name;
    const genre = document.createElement('small'); genre.textContent = item.genre;
    middle.append(artist, genre);
    const stage = document.createElement('div'); stage.className = 'schedule-stage';
    const dot = document.createElement('span'); dot.setAttribute('aria-hidden','true');
    stage.append(dot, document.createTextNode(item.stage));
    row.append(time, middle, stage);
    container.appendChild(row);
  });
}

function renderFullSchedule() {
  const container = document.getElementById('fullSchedule');
  if (!container) return;
  container.replaceChildren();
  [['sat','DAY 01 / 05.22 SATURDAY'],['sun','DAY 02 / 05.23 SUNDAY']].forEach(([day,title]) => {
    const heading = document.createElement('h3');
    heading.className = 'modal-day-title'; heading.textContent = title;
    container.appendChild(heading);
    festivalSchedule[day].forEach(item => {
      const row = document.createElement('div'); row.className = 'modal-schedule-row';
      const time = document.createElement('time'); time.textContent = item.time;
      const name = document.createElement('strong'); name.textContent = item.name;
      const genre = document.createElement('span'); genre.textContent = `${item.genre} · ${item.stage}`;
      row.append(time,name,genre); container.appendChild(row);
    });
  });
}

// 1. 모바일 메뉴. 메뉴 링크를 누르면 접힙니다.
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (menuToggle && mobileNav) {
  function setMenu(open) {
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '모바일 메뉴 닫기' : '모바일 메뉴 열기');
  }
  menuToggle.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });
}

// 2. 라인업 필터: hidden으로 해당 날짜의 아티스트만 보여줍니다.
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const day = button.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.artist-card').forEach(card => {
      card.hidden = day !== 'all' && card.dataset.day !== day;
    });
  });
});

// 3. 타임테이블 날짜 탭.
renderScheduleDay('sat');
document.querySelectorAll('.day-tab').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.day-tab').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderScheduleDay(button.dataset.day);
  });
});
renderFullSchedule();

// 4. 팝업: 전체 일정 / 전체 프로그램 버튼에 공통 사용합니다.
// <dialog>는 ESC로 닫기, 접근성 관련 기능을 브라우저에서 기본 제공합니다.
document.querySelectorAll('[data-modal]').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.modal);
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
  });
});
document.querySelectorAll('.site-dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  // 반투명 배경을 누르면 팝업이 닫힙니다.
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});
