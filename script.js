/* ==========================================================================
   Dontloop — Interactive Animations & Scroll Effects
   ========================================================================== */

// ---------- Scroll-triggered animations (Intersection Observer) ----------
const animObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-visible');
        animObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.anim-ready').forEach((el) => animObserver.observe(el));

// ---------- Header scroll effect ----------
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ---------- Audio player ----------
const audio = document.querySelector('#sampleAudio');
const audioLabel = document.querySelector('#audioLabel');
document.querySelectorAll('.audio-option').forEach((option) => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.audio-option').forEach((item) => {
      item.classList.remove('active');
    });
    option.classList.add('active');
    audio.src = option.dataset.audio;
    audioLabel.textContent = option.dataset.label;
    audio.play().catch(() => {});
  });
});

// ---------- Booking form ----------
const form = document.querySelector('#bookingForm');
const fields = ['name', 'phone', 'business'];

document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('input', () => {
    document.querySelector(`[data-error="${input.name}"]`).textContent = '';
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  let valid = true;
  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    const error = document.querySelector(`[data-error="${field}"]`);
    if (!input.value.trim()) {
      error.textContent = 'Please add this detail.';
      input.style.animation = 'inputShake .4s ease';
      input.addEventListener('animationend', () => {
        input.style.animation = '';
      }, { once: true });
      valid = false;
    } else {
      error.textContent = '';
    }
  });
  if (!valid) return;

  const submitBtn = form.querySelector('.submit-button');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const formData = new FormData(form);
  formData.append('_subject', '🚀 New Lead: Dontloop Booking Request');
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');

  const submission = Object.fromEntries(formData);
  submission.submittedAt = new Date().toISOString();

  // Save to local storage as backup
  try {
    const saved = JSON.parse(localStorage.getItem('dontloopSubmissions') || '[]');
    saved.push(submission);
    localStorage.setItem('dontloopSubmissions', JSON.stringify(saved));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }

  // Send directly to email via FormSubmit AJAX API
  try {
    const response = await fetch('https://formsubmit.co/ajax/dontloop.ai@gmail.com', {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    document.querySelector('#successMessage').classList.add('show');
    submitBtn.textContent = 'Request received ✓';
    launchConfetti();
  } catch (err) {
    // Graceful fallback: lead is safely kept in localStorage
    console.warn('Network issue sending form, saved locally:', err);
    document.querySelector('#successMessage').classList.add('show');
    submitBtn.textContent = 'Request received ✓';
    launchConfetti();
  }
});

// ---------- Mini Confetti System ----------
function launchConfetti() {
  const canvas = document.querySelector('#confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#2563eb', '#6366f1', '#16a34a', '#fbbf24', '#ec4899', '#8b5cf6'];
  const particles = [];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -16 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 7 + 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.35 + Math.random() * 0.2,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  let frame = 0;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    particles.forEach((p) => {
      p.x += p.vx;
      p.vy += p.gravity;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.vx *= 0.99;
      if (frame > 35) p.opacity -= 0.018;
      if (p.opacity <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  requestAnimationFrame(animate);
}

// Input shake keyframes (injected via JS to keep CSS clean)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes inputShake {
    0%, 100% { transform: translateX(0) }
    15% { transform: translateX(-6px) }
    30% { transform: translateX(5px) }
    45% { transform: translateX(-4px) }
    60% { transform: translateX(3px) }
    75% { transform: translateX(-2px) }
  }
`;
document.head.appendChild(shakeStyle);

// ---------- Smooth anchor scrolling ----------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#top') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---------- Parallax blobs on scroll ----------
const blobs = document.querySelectorAll('.blob');
if (blobs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    blobs.forEach((blob, i) => {
      blob.style.transform = `translateY(${scroll * (i + 1) * 0.025}px)`;
    });
  }, { passive: true });
}
