// cv2026.js — interaksi halaman CV: menu, bagikan, unduh PDF, animasi masuk.
// Tanpa jQuery/Bootstrap, cukup 3 kB dan berjalan setelah DOM siap (atribut defer).
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Menu mobile ------------------------------------------------------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        document.addEventListener('click', function (e) {
            if (nav.classList.contains('open') && !nav.contains(e.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    /* Garis bawah header muncul setelah halaman digulir ------------------ */
    var header = document.querySelector('.site-header');

    if (header) {
        var syncHeader = function () {
            header.classList.toggle('is-stuck', window.scrollY > 8);
        };
        syncHeader();
        window.addEventListener('scroll', syncHeader, { passive: true });
    }

    /* Persentase skill: cukup ubah data-level di HTML, bar dan angka ikut. */
    function syncSkillLevels() {
        document.querySelectorAll('.skill-bar[data-level]').forEach(function (skill) {
            var rawLevel = Number(skill.dataset.level);
            var level = Math.max(0, Math.min(100, Number.isFinite(rawLevel) ? rawLevel : 0));
            var percentage = level + '%';
            var value = skill.querySelector('.skill-bar-top strong');

            skill.style.setProperty('--level', percentage);

            if (value) {
                value.textContent = percentage;
            }
        });
    }

    syncSkillLevels();
    window.addEventListener('beforeprint', syncSkillLevels);

    /* "BAGIKAN" -> Web Share API, jatuh ke clipboard bila tidak tersedia -- */
    document.querySelectorAll('.btn-share').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var data = {
                title: document.title,
                text: 'CV Fikri Abdillah Sanubari',
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(data).catch(function () { /* dibatalkan pengguna */ });
                return;
            }

            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href).then(function () {
                    if (!btn.dataset.originalMarkup) {
                        btn.dataset.originalMarkup = btn.innerHTML;
                    }
                    btn.textContent = 'TAUTAN DISALIN';
                    setTimeout(function () {
                        btn.innerHTML = btn.dataset.originalMarkup;
                    }, 2000);
                });
            }
        });
    });

    /* Animasi muncul saat elemen masuk layar ---------------------------- */
    var revealables = document.querySelectorAll('.reveal');

    if (!revealables.length) {
        return;
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealables.forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });

    revealables.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i, 5) * 60 + 'ms';
        observer.observe(el);
    });
})();
