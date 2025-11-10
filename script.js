const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
    particles: [],
    animationFrame: null,
};

const colors = [
    'rgba(0, 224, 255, 0.65)',
    'rgba(255, 0, 255, 0.55)',
    'rgba(0, 255, 168, 0.5)',
    'rgba(127, 93, 255, 0.45)',
];

function initModeToggle() {
    const toggle = document.getElementById('modeToggle');
    if (!toggle) return;

    const storedMode = localStorage.getItem('prisma-theme');
    if (storedMode === 'light') {
        document.body.classList.add('light-mode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('prisma-theme', mode);
    });
}

function initFooterClock() {
    const clockEl = document.getElementById('footerClock');
    if (!clockEl) return;

    function updateClock() {
        const now = new Date();
        const formatted = now.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
        });
        clockEl.textContent = formatted;
    }

    updateClock();
    setInterval(updateClock, 60 * 1000);
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-animate]');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
        }
    );

    revealElements.forEach(el => observer.observe(el));
}

function createParticlesContext() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return { canvas, ctx, resizeCanvas };
}

function spawnParticles(total = 60) {
    const context = state.canvas;
    if (!context) return;

    const { canvas } = context;

    state.particles = Array.from({ length: total }, () => {
        const size = Math.random() * 3 + 1;
        return {
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            size,
            alpha: Math.random() * 0.6 + 0.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocityX: (Math.random() - 0.5) * 0.5,
            velocityY: (Math.random() - 0.5) * 0.5,
        };
    });
}

function animateParticles() {
    if (!state.canvas || prefersReducedMotion.matches) return;

    const { ctx, canvas } = state.canvas;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    state.particles.forEach(particle => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x < -50) particle.x = width + 50;
        if (particle.x > width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = height + 50;
        if (particle.y > height + 50) particle.y = -50;

        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });

    ctx.globalAlpha = 1;
    state.animationFrame = requestAnimationFrame(animateParticles);
}

function mountParticles() {
    const context = createParticlesContext();
    if (!context) return;

    state.canvas = context;
    spawnParticles(prefersReducedMotion.matches ? 0 : 70);
    animateParticles();

    window.addEventListener('resize', () => {
        if (prefersReducedMotion.matches) return;
        spawnParticles(state.particles.length || 70);
    });

    prefersReducedMotion.addEventListener('change', event => {
        if (event.matches) {
            if (state.animationFrame) {
                cancelAnimationFrame(state.animationFrame);
                state.animationFrame = null;
            }
            state.animationFrame = null;
            state.particles = [];
            context.ctx.clearRect(0, 0, context.canvas.offsetWidth, context.canvas.offsetHeight);
        } else {
            spawnParticles(70);
            animateParticles();
        }
    });
}

function initSmoothAnchorScroll() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');
    if (!navToggle || !mainNav) return;

    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.setAttribute('aria-hidden', 'true');

    const closeMenu = () => {
        navToggle.classList.remove('is-open');
        mainNav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
    };

    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.classList.toggle('is-open');
        mainNav.classList.toggle('is-open', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        mainNav.setAttribute('aria-hidden', String(!isOpen));
    });

    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle.classList.contains('is-open')) {
                closeMenu();
            }
        });
    });

    const desktopMediaQuery = window.matchMedia('(min-width: 961px)');
    desktopMediaQuery.addEventListener('change', event => {
        if (event.matches) {
            closeMenu();
        }
    });
}

function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const nombre = formData.get('nombre');

        form.reset();
        const message = nombre ? `¡Gracias ${nombre}! Pronto nos pondremos en contacto contigo.` : '¡Gracias! Pronto nos pondremos en contacto contigo.';

        const toast = document.createElement('div');
        toast.className = 'contact-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        setTimeout(() => {
            toast.classList.remove('is-visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 3600);
    });
}

function injectToastStyles() {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .contact-toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: rgba(0, 0, 0, 0.75);
            border: 1px solid rgba(0, 224, 255, 0.25);
            padding: 0.95rem 1.4rem;
            border-radius: 0.9rem;
            color: #ffffff;
            font-family: var(--font-base, 'Inter', sans-serif);
            letter-spacing: 0.03em;
            box-shadow: 0 20px 45px rgba(0, 224, 255, 0.18);
            opacity: 0;
            transform: translateY(15px);
            transition: opacity 0.45s ease, transform 0.45s ease;
            z-index: 20;
        }

        .contact-toast.is-visible {
            opacity: 1;
            transform: translateY(0);
        }

        @media (max-width: 640px) {
            .contact-toast {
                left: 1.25rem;
                right: 1.25rem;
                bottom: 1.5rem;
                text-align: center;
            }
        }
    `;

    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
    initModeToggle();
    initFooterClock();
    initRevealAnimations();
    initSmoothAnchorScroll();
    initMobileNav();
    initContactForm();
    injectToastStyles();
    mountParticles();
});


