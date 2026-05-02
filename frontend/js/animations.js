/* ============================================
   ANIMATIONS ENGINE — Lost & Found System
   Scroll reveals, toasts, page transitions
   ============================================ */

// --- Page Load Animation Orchestrator ---
document.addEventListener('DOMContentLoaded', () => {
  // Animate elements with stagger
  const animElements = document.querySelectorAll('.anim-ready');
  animElements.forEach((el, i) => {
    const delay = el.dataset.delay || (i * 100);
    setTimeout(() => {
      el.classList.add('animate-fade-in-up');
      el.style.opacity = '1';
    }, delay);
  });

  // Intersection Observer for scroll-reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

  // Stagger table rows
  const tableRows = document.querySelectorAll('.glass-table tbody tr');
  tableRows.forEach((row, i) => {
    row.style.opacity = '0';
    row.style.animation = `slideInLeft 0.4s ease-out ${i * 0.06}s both`;
  });
});

// --- Toast Notification System ---
class ToastManager {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  }

  show(message, type = 'success', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    this.container.appendChild(toast);

    // Auto-remove
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error'); }
  info(msg) { this.show(msg, 'info'); }
  warning(msg) { this.show(msg, 'warning'); }
}

// Global toast instance
const toast = new ToastManager();

// --- Override default alert for premium toasts ---
const _originalAlert = window.alert;
window.alert = function(msg) {
  if (msg && typeof msg === 'string') {
    if (msg.toLowerCase().includes('success') || msg.includes('✅')) {
      toast.success(msg);
    } else if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('denied')) {
      toast.error(msg);
    } else {
      toast.info(msg);
    }
  } else {
    _originalAlert(msg);
  }
};

// --- Smooth Number Counter ---
function animateCounter(element, target, duration = 1500) {
  let start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

// --- Ripple Effect on Buttons ---
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-glow, .btn-primary-glow, .btn-success-glow');
  if (!btn) return;

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    pointer-events: none;
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
  `;

  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
  ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
});

// Add ripple keyframes dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleEffect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// --- Tilt effect on cards ---
document.querySelectorAll('.option-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotateX = ((y - cy) / cy) * -5;
    const rotateY = ((x - cx) / cx) * 5;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// --- Typing effect utility ---
function typeText(element, text, speed = 40) {
  let i = 0;
  element.textContent = '';
  return new Promise(resolve => {
    const timer = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}
