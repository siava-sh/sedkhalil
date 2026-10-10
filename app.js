
/* ==================================================
   DANCE OF UNION — AUDIO PLAYER
   Lightweight version: no Three.js or WebGL
   ================================================== */

const audio = document.querySelector('#audio');
const playButton = document.querySelector('#play');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const seek = document.querySelector('#seek');
const trackNumber = document.querySelector('#track-number');
const trackTitle = document.querySelector('#track-title');
const currentTime = document.querySelector('#current-time');
const duration = document.querySelector('#duration');
const status = document.querySelector('#status');

const tracks = [
  '01_مست و دیوانه.mp3',
  '02_وصل و هجران.mp3',
  '03_مظهر حسن ازل.mp3',
  '04_قمار عشق.mp3',
  '05_ساز و آواز ۱.mp3',
  '06_دست طلب.mp3',
  '07_دست مرحمت.mp3',
  '08_حنّانه شو.mp3',
  '09_ساز و آواز ۲.mp3',
  '10_ساقی نامه کُردی.mp3',
  '11_موج بقا.mp3',
  '12_شوق وصل.mp3',
  '13_آتشِ دل.mp3',
  '14_سرّ عشق.mp3',
  '15_کریم لامکان.mp3',
  '16_چه مستی است ندانم.mp3',
  '17_حال خونین دلان.mp3',
  '18_شوق لیلی.mp3',
  '19_همسران مستم.mp3',
  '20_یار.mp3',
  '21_تکنوازی.mp3',
  '22_بی‌قرار (صوفی نامه).mp3'
];

let trackIndex = 0;

/* ==================================================
   TRACK HELPERS
   ================================================== */

function trackName(filename) {
  return filename
    .replace(/^\d+_/, '')
    .replace(/\.mp3$/i, '');
}

function trackUrl(filename) {
  return `tracks/${encodeURIComponent(filename)}`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/* ==================================================
   HAMBURGER TRACK MENU
   ================================================== */

const menuButton = document.createElement('button');

menuButton.id = 'track-menu-button';
menuButton.className = 'track-menu-button';
menuButton.type = 'button';
menuButton.setAttribute('aria-label', 'Open track list');
menuButton.setAttribute('aria-expanded', 'false');
menuButton.innerHTML = '<span></span><span></span><span></span>';

const menu = document.createElement('aside');

menu.id = 'track-menu';
menu.className = 'track-menu';
menu.setAttribute('aria-label', 'Album tracks');
menu.setAttribute('aria-hidden', 'true');

menu.innerHTML = `
  <div class="track-menu-header">
    <span>THE ALBUM</span>
    <button class="track-menu-close"
            type="button"
            aria-label="Close track list">×</button>
  </div>
  <div class="track-list"></div>
`;

document.querySelector('#monument').append(menuButton, menu);

const trackList = menu.querySelector('.track-list');
const closeMenuButton = menu.querySelector('.track-menu-close');

tracks.forEach((filename, index) => {
  const row = document.createElement('div');
  row.className = 'track-row';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'track-option';
  button.dataset.index = String(index);
  button.setAttribute('aria-label', `Play track ${index + 1}: ${trackName(filename)}`);

  const number = document.createElement('span');
  number.className = 'track-option-number';
  number.textContent = String(index + 1).padStart(2, '0');

  const title = document.createElement('span');
  title.className = 'track-option-title';
  title.textContent = trackName(filename);
  title.dir = 'rtl';

  button.append(number, title);

  button.addEventListener('click', () => {
    loadTrack(index, true);
    setMenuOpen(false);
  });

  /* Download link is separate from the play button. */
  const download = document.createElement('a');
  download.className = 'track-download';
  download.href = trackUrl(filename);
  download.download = filename;
  download.setAttribute('aria-label', `Download ${trackName(filename)}`);
  download.title = 'Download track';

  download.innerHTML = `
    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="1.6"
         stroke-linecap="round"
         stroke-linejoin="round"
         aria-hidden="true">
      <path d="M12 3v12"></path>
      <path d="m7 10 5 5 5-5"></path>
      <path d="M5 17v3h14v-3"></path>
    </svg>
  `;

  row.append(button, download);
  trackList.append(row);
});

function setMenuOpen(open) {
  menu.classList.toggle('is-open', open);
  menuButton.classList.toggle('is-open', open);

  menuButton.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute(
    'aria-label',
    open ? 'Close track list' : 'Open track list'
  );
}

menuButton.addEventListener('click', () => {
  setMenuOpen(!menu.classList.contains('is-open'));
});

closeMenuButton.addEventListener('click', () => {
  setMenuOpen(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setMenuOpen(false);
  }
});

/* ==================================================
   AUDIO PLAYER
   ================================================== */

function updateActiveTrack() {
  trackList.querySelectorAll('.track-option').forEach((button, index) => {
    const active = index === trackIndex;

    button.classList.toggle('is-active', active);

    if (active) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function loadTrack(index, autoplay = false) {
  trackIndex = (index + tracks.length) % tracks.length;

  const filename = tracks[trackIndex];

  audio.src = trackUrl(filename);
  audio.load();

  trackNumber.textContent =
    `TRACK ${String(trackIndex + 1).padStart(2, '0')} / ${tracks.length}`;

  trackTitle.textContent = trackName(filename);
  currentTime.textContent = '0:00';
  duration.textContent = '0:00';
  seek.value = '0';

  updateActiveTrack();

  if (autoplay) {
    audio.play().catch(() => {
      if (status) {
        status.textContent = 'Unable to play this track.';
      }
    });
  }
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      if (status) {
        status.textContent = 'Unable to play this track.';
      }
    }
  } else {
    audio.pause();
  }
});

previousButton.addEventListener('click', () => {
  loadTrack(trackIndex - 1, true);
});

nextButton.addEventListener('click', () => {
  loadTrack(trackIndex + 1, true);
});

audio.addEventListener('play', () => {
  playButton.textContent = 'Ⅱ';
  playButton.setAttribute('aria-label', 'Pause');
});

audio.addEventListener('pause', () => {
  playButton.textContent = '▶';
  playButton.setAttribute('aria-label', 'Play');
});

audio.addEventListener('ended', () => {
  loadTrack(trackIndex + 1, true);
});

audio.addEventListener('loadedmetadata', () => {
  duration.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  currentTime.textContent = formatTime(audio.currentTime);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    seek.value = String(
      Math.round((audio.currentTime / audio.duration) * 1000)
    );
  }
});

seek.addEventListener('input', () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
  }
});

/* Start with track 01 ready to play. */
loadTrack(0);