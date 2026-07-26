// cv-pro.js — membuat tombol-tombol pada CV benar-benar berfungsi.
(function () {
    'use strict';

    // "DOWNLOAD CV" -> dialog cetak browser (Save as PDF) memakai gaya @media print.
    document.querySelectorAll('.btn-download-cv').forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.print();
        });
    });

    // "SHARE" -> Web Share API bila tersedia, jika tidak salin tautan ke clipboard.
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
                    var markup = btn.dataset.originalMarkup || btn.innerHTML;
                    btn.dataset.originalMarkup = markup;
                    btn.textContent = 'TAUTAN DISALIN';
                    setTimeout(function () {
                        btn.innerHTML = markup;
                    }, 2000);
                });
            }
        });
    });
})();
