/**
 * DEATHPET - Dialogue-focused VHS Horror
 */

(function() {
    'use strict';

    // Pet pixel art (16x16)
    const PET = [
        '0000000000000000',
        '0000011111100000',
        '0000100000010000',
        '0001000000001000',
        '0010011001100100',
        '0010011001100100',
        '0100000000000010',
        '0100000000000010',
        '0100100000010010',
        '0100010000100010',
        '0100001111000010',
        '0010000000000100',
        '0010000000000100',
        '0001000000001000',
        '0000111111110000',
        '0000000000000000',
    ];

    const PET_CORRUPT = [
        '0000000110000000',
        '0001011111101000',
        '0000100000010000',
        '0011000000001100',
        '0010011001100100',
        '0110111111110110',
        '0100000000000010',
        '0100000110000010',
        '1100000110000011',
        '0100111111110010',
        '0100100000010010',
        '0010000000000100',
        '0010000000000100',
        '0001100110011000',
        '0000011111100000',
        '0000000000000000',
    ];

    // Render pixel art
    function renderPet(canvasId, art, glitch = false) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        canvas.innerHTML = '';
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                if (art[y][x] === '1') {
                    pixel.classList.add('on');
                }
                canvas.appendChild(pixel);
            }
        }
    }

    // Init all pet canvases
    function initPets() {
        for (let i = 1; i <= 16; i++) {
            renderPet('petCanvas' + i, PET);
        }
        renderPet('petCanvasCorrupt', PET_CORRUPT);
    }

    // Timestamp
    const startTime = Date.now();
    function updateTime() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        const el = document.getElementById('timestamp');
        if (el) el.textContent = h + ':' + m + ':' + s;
        requestAnimationFrame(updateTime);
    }

    // Form
    function initForm() {
        const form = document.getElementById('emailForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const input = form.querySelector('input');

            btn.textContent = '...';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = 'DONE';
                btn.style.background = '#8bac0f';
                input.value = '';

                const count = document.getElementById('waitCount');
                if (count) {
                    const n = parseInt(count.textContent.replace(/,/g, ''));
                    count.textContent = (n + 1).toLocaleString();
                }

                setTimeout(() => {
                    btn.textContent = 'REGISTER';
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        });
    }

    // Share
    function initShare() {
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = location.href;
                if (btn.dataset.platform === 'twitter') {
                    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('"주인님 내일도 와요?" "꼭이요."') + '&url=' + encodeURIComponent(url), '_blank');
                } else {
                    navigator.clipboard.writeText(url);
                    btn.textContent = 'COPIED';
                    setTimeout(() => btn.textContent = 'COPY', 1500);
                }
            });
        });
    }

    // Init
    function init() {
        initPets();
        updateTime();
        initForm();
        initShare();

        const count = document.getElementById('waitCount');
        if (count) {
            count.textContent = (2847 + Math.floor(Math.random() * 100)).toLocaleString();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
