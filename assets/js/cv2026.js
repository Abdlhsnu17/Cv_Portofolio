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

    /* Progress halaman dan tombol kembali ke atas ---------------------- */
    var progress = document.querySelector('.scroll-progress span');
    var backToTop = document.querySelector('.back-to-top');

    function syncScrollTools() {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

        if (progress) {
            progress.style.width = percentage + '%';
        }

        if (backToTop) {
            backToTop.classList.toggle('is-visible', window.scrollY > 520);
        }
    }

    syncScrollTools();
    window.addEventListener('scroll', syncScrollTools, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    var skillStorageKey = 'cv2026.skillLevels';

    function readStoredSkillLevels() {
        try {
            return JSON.parse(localStorage.getItem(skillStorageKey)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveStoredSkillLevels(levels) {
        try {
            localStorage.setItem(skillStorageKey, JSON.stringify(levels));
        } catch (e) {
            /* localStorage bisa tidak tersedia pada mode privat; abaikan. */
        }
    }

    function normalizeLevel(level) {
        var numericLevel = Number(level);

        return Math.max(0, Math.min(100, Number.isFinite(numericLevel) ? numericLevel : 0));
    }

    /* Persentase skill: ubah data-level atau geser kontrol, bar dan angka ikut. */
    function syncSkillLevels() {
        var storedLevels = readStoredSkillLevels();

        document.querySelectorAll('.skill-bar[data-level]').forEach(function (skill) {
            var skillId = skill.dataset.skillId;
            var storedLevel = skillId ? storedLevels[skillId] : null;
            var level = normalizeLevel(storedLevel != null ? storedLevel : skill.dataset.level);
            var percentage = level + '%';
            var value = skill.querySelector('.skill-bar-top strong');
            var control = skillId ? document.querySelector('[data-skill-target="' + skillId + '"]') : null;

            skill.dataset.level = String(level);
            skill.style.setProperty('--level', percentage);

            if (value) {
                value.textContent = percentage;
            }

            if (control) {
                control.value = String(level);
            }
        });
    }

    syncSkillLevels();
    window.addEventListener('beforeprint', syncSkillLevels);

    function loadJsPdf() {
        if (window.jspdf && window.jspdf.jsPDF) {
            return Promise.resolve(window.jspdf.jsPDF);
        }

        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');

            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.jspdf.jsPDF);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function pdfText(doc, text, x, y, maxWidth, lineHeight) {
        var lines = doc.splitTextToSize(text, maxWidth);

        doc.text(lines, x, y);
        return y + (lines.length * lineHeight);
    }

    function addPdfSectionTitle(doc, title, x, y) {
        doc.setTextColor(55, 48, 163);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(title.toUpperCase(), x, y);
        doc.setDrawColor(55, 48, 163);
        doc.setLineWidth(0.6);
        doc.line(x, y + 2.5, x + 18, y + 2.5);
        return y + 9;
    }

    function addPdfBullet(doc, text, x, y, maxWidth) {
        doc.setTextColor(31, 31, 31);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.6);
        doc.circle(x + 1.2, y - 1.2, 0.8, 'F');
        return pdfText(doc, text, x + 4, y, maxWidth - 4, 4.2) + 1;
    }

    function getSkillData() {
        return Array.prototype.map.call(document.querySelectorAll('.skill-bar[data-level]'), function (skill) {
            var name = skill.querySelector('.skill-bar-top span');

            return {
                name: name ? name.textContent.trim() : '',
                level: normalizeLevel(skill.dataset.level)
            };
        });
    }

    function getProfileImageData() {
        var img = document.querySelector('.hero-photo img');

        if (!img) {
            return Promise.resolve(null);
        }

        return new Promise(function (resolve) {
            var source = new Image();

            source.crossOrigin = 'anonymous';
            source.onload = function () {
                var canvas = document.createElement('canvas');
                var targetRatio = 26 / 32;
                var sourceRatio = source.naturalWidth / source.naturalHeight;
                var cropWidth = source.naturalWidth;
                var cropHeight = source.naturalHeight;
                var offsetX = 0;
                var offsetY = 0;
                var ctx = canvas.getContext('2d');

                if (sourceRatio > targetRatio) {
                    cropWidth = source.naturalHeight * targetRatio;
                    offsetX = (source.naturalWidth - cropWidth) / 2;
                } else {
                    cropHeight = source.naturalWidth / targetRatio;
                    offsetY = Math.max(0, (source.naturalHeight - cropHeight) * 0.35);
                }

                canvas.width = 390;
                canvas.height = 480;
                ctx.drawImage(source, offsetX, offsetY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.92));
            };
            source.onerror = function () {
                resolve(null);
            };
            source.src = img.currentSrc || img.src;
        });
    }

    function generateResumePdf(jsPDF) {
        return getProfileImageData().then(function (profileImage) {
            var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            var left = 14;
            var right = 124;
            var rightWidth = 72;
            var y = 18;
            var skills = getSkillData();

            doc.setFillColor(55, 48, 163);
            doc.rect(0, 0, 210, 44, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('Fikri Abdillah Sanubari', left, 18);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);
            doc.text('Administrasi - Quality Control - Pelayanan Operasional', left, 26);
            doc.setFontSize(8.8);
            doc.text('Jakarta Timur | +62 878-8886-8060 | abdillahsanubari@gmail.com | Siap bekerja - Jabodetabek', left, 34);

            if (profileImage) {
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(166, 6, 28, 34, 2, 2, 'F');
                doc.addImage(profileImage, 'JPEG', 167, 7, 26, 32);
                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(0.9);
                doc.roundedRect(166, 6, 28, 34, 2, 2, 'S');
            }

        y = 57;
        y = addPdfSectionTitle(doc, 'Ringkasan Profesional', left, y);
        doc.setTextColor(31, 31, 31);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        y = pdfText(doc, 'Tenaga administrasi dan quality control dengan pengalaman 7+ tahun di media cetak, manufaktur otomotif, dan pelayanan kesehatan. Terbiasa menjaga akurasi data, mengikuti SOP, dan berkoordinasi lintas unit pada pekerjaan operasional harian.', left, y, 100, 4.6) + 6;

        y = addPdfSectionTitle(doc, 'Pengalaman Kerja', left, y);
        doc.setTextColor(13, 18, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Staf Pelayanan Operasional', left, y);
        doc.setTextColor(55, 48, 163);
        doc.setFontSize(8.5);
        doc.text('2021 - 2024', left + 58, y);
        y += 5;
        doc.setTextColor(90, 90, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('RSUP Persahabatan - Jakarta Timur', left, y);
        y += 5;
        y = addPdfBullet(doc, 'Melayani pasien dan pengunjung sesuai SOP, termasuk pengarahan alur layanan dan penanganan keluhan awal.', left, y, 100);
        y = addPdfBullet(doc, 'Mendukung administrasi pendaftaran, pemeriksaan kelengkapan, dan pengarsipan berkas pasien.', left, y, 100);
        y = addPdfBullet(doc, 'Berkoordinasi dengan unit terkait agar layanan tetap tertib pada jam sibuk.', left, y, 100) + 3;

        doc.setTextColor(13, 18, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Quality Control', left, y);
        doc.setTextColor(55, 48, 163);
        doc.setFontSize(8.5);
        doc.text('2018 - 2020', left + 58, y);
        y += 5;
        doc.setTextColor(90, 90, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('PT Yamaha Motor Indonesia', left, y);
        y += 5;
        y = addPdfBullet(doc, 'Melakukan inspeksi hasil produksi mesin berdasarkan standar mutu perusahaan.', left, y, 100);
        y = addPdfBullet(doc, 'Memisahkan produk NG dan menyusun laporan temuan harian untuk tim produksi.', left, y, 100);
        y = addPdfBullet(doc, 'Menerapkan 5S dan disiplin K3 di area kerja.', left, y, 100) + 3;

        doc.setTextColor(13, 18, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Staf Administrasi', left, y);
        doc.setTextColor(55, 48, 163);
        doc.setFontSize(8.5);
        doc.text('2016 - 2017', left + 58, y);
        y += 5;
        doc.setTextColor(90, 90, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('PT Gramedia Asri Media', left, y);
        y += 5;
        y = addPdfBullet(doc, 'Mengelola pencatatan, penomoran, dan pengarsipan dokumen operasional harian.', left, y, 100);
        y = addPdfBullet(doc, 'Menyusun laporan rutin dengan Microsoft Excel dan Word untuk kebutuhan supervisor.', left, y, 100);
        y = addPdfBullet(doc, 'Menjaga sinkronisasi data stok dan dokumen pengiriman bersama tim terkait.', left, y, 100) + 6;

        y = addPdfSectionTitle(doc, 'Pendidikan', left, y);
        doc.setTextColor(13, 18, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('S1 - Universitas Esa Unggul', left, y);
        doc.setTextColor(55, 48, 163);
        doc.setFontSize(8.3);
        doc.text('2022 - sekarang', left + 58, y);
        y += 5;
        doc.setTextColor(90, 90, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('Jakarta - Program studi: (Teknik Informatika)', left, y);
        y += 8;
        doc.setTextColor(13, 18, 32);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text('SMK - Jurusan Multimedia', left, y);
        doc.setTextColor(55, 48, 163);
        doc.setFontSize(8.3);
        doc.text('2013 - 2016', left + 58, y);
        y += 5;
        doc.setTextColor(90, 90, 90);
        doc.setFont('helvetica', 'normal');
        doc.text('SMK Negeri 34 Jakarta', left, y);

        y = 57;
        y = addPdfSectionTitle(doc, 'Data Pribadi', right, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.6);
        doc.setTextColor(31, 31, 31);
        y = pdfText(doc, 'Domisili: Jakarta Timur, DKI Jakarta', right, y, rightWidth, 4.4);
        y = pdfText(doc, 'Telepon: +62 878-8886-8060', right, y + 1, rightWidth, 4.4);
        y = pdfText(doc, 'Email: abdillahsanubari@gmail.com', right, y + 1, rightWidth, 4.4);
        y = pdfText(doc, 'Status: Siap bekerja - Jabodetabek', right, y + 1, rightWidth, 4.4) + 6;

        y = addPdfSectionTitle(doc, 'Keahlian', right, y);
        skills.forEach(function (skill) {
            var barWidth = 46;

            doc.setTextColor(31, 31, 31);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.4);
            doc.text(skill.name, right, y);
            doc.setTextColor(55, 48, 163);
            doc.text(skill.level + '%', right + 58, y, { align: 'right' });
            doc.setFillColor(230, 230, 230);
            doc.roundedRect(right, y + 2.2, barWidth, 2.4, 1.2, 1.2, 'F');
            doc.setFillColor(55, 48, 163);
            doc.roundedRect(right, y + 2.2, barWidth * (skill.level / 100), 2.4, 1.2, 1.2, 'F');
            y += 8.5;
        });

        y += 4;
        y = addPdfSectionTitle(doc, 'Bahasa', right, y);
        doc.setTextColor(31, 31, 31);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.6);
        doc.text('Indonesia - Native', right, y);
        doc.text('Inggris - Pasif', right, y + 5);

            doc.save('cv-fikri-abdillah-sanubari.pdf');
        });
    }

    document.querySelectorAll('[data-generate-pdf]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var originalText = btn.textContent;

            syncSkillLevels();
            btn.disabled = true;
            btn.textContent = 'Membuat PDF...';

            loadJsPdf().then(function (jsPDF) {
                return generateResumePdf(jsPDF);
            }).catch(function () {
                alert('PDF belum bisa dibuat otomatis. Periksa koneksi internet, lalu coba lagi.');
            }).finally(function () {
                btn.disabled = false;
                btn.textContent = originalText;
            });
        });
    });

    document.querySelectorAll('[data-skill-target]').forEach(function (control) {
        control.addEventListener('input', function () {
            var levels = readStoredSkillLevels();
            var skillId = control.dataset.skillTarget;
            var skill = document.querySelector('[data-skill-id="' + skillId + '"]');
            var level = normalizeLevel(control.value);

            levels[skillId] = level;
            saveStoredSkillLevels(levels);

            if (skill) {
                skill.dataset.level = String(level);
            }

            syncSkillLevels();
        });
    });

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
