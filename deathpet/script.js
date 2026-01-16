/**
 * DEATHPET - Analog Horror Experience
 * VHS aesthetic with pixel art Tamagotchi
 */

(function() {
    'use strict';

    // ============================================
    // PIXEL ART DATA (16x16 grids)
    // ============================================

    const PIXEL_ART = {
        // Egg hatching
        egg: [
            '0000000000000000',
            '0000001111000000',
            '0000110000110000',
            '0001000000001000',
            '0010000000000100',
            '0010000000000100',
            '0100000000000010',
            '0100000110000010',
            '0100001001000010',
            '0100000110000010',
            '0100000000000010',
            '0010000000000100',
            '0010000000000100',
            '0001000000001000',
            '0000111111110000',
            '0000000000000000',
        ],

        // Happy pet
        happy: [
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
        ],

        // Sad/waiting pet
        sad: [
            '0000000000000000',
            '0000011111100000',
            '0000100000010000',
            '0001000000001000',
            '0010000000000100',
            '0010011001100100',
            '0100011001100010',
            '0100000000000010',
            '0100000000000010',
            '0100001111000010',
            '0100010000100010',
            '0010000000000100',
            '0010100000010100',
            '0001010000101000',
            '0000111111110000',
            '0000000000000000',
        ],

        // Corrupted pet - unsettling
        corrupted: [
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
        ],

        // Staring pet - large, unsettling
        stare: [
            '0000000000000000',
            '0000011111100000',
            '0000100000010000',
            '0001000000001000',
            '0010000000000100',
            '0010111001110100',
            '0101111011110100',
            '0101111011110010',
            '0100111001110010',
            '0100000000000010',
            '0100000000000010',
            '0100011111100010',
            '0010000000000100',
            '0001000000001000',
            '0000111111110000',
            '0000000000000000',
        ],
    };

    // ============================================
    // STATE
    // ============================================

    const state = {
        currentScene: 1,
        timestamp: 0,
        startTime: Date.now(),
        hasSeenSubliminal: false,
        scrollY: 0,
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============================================
    // PIXEL ART RENDERER
    // ============================================

    function renderPixelArt(canvasId, artKey, glitched = false) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const art = PIXEL_ART[artKey];
        if (!art) return;

        canvas.innerHTML = '';

        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';

                if (art[y][x] === '1') {
                    pixel.classList.add('on');

                    // Add glitch effect to random pixels
                    if (glitched && Math.random() < 0.15) {
                        pixel.classList.add('glitch');
                    }
                }

                canvas.appendChild(pixel);
            }
        }
    }

    // Render all pixel art on load
    function initPixelArt() {
        renderPixelArt('eggCanvas', 'egg');
        renderPixelArt('happyCanvas', 'happy');
        renderPixelArt('sadCanvas', 'sad');
        renderPixelArt('corruptedCanvas', 'corrupted', true);
        renderPixelArt('stareCanvas', 'stare');
    }

    // ============================================
    // TIMESTAMP
    // ============================================

    function updateTimestamp() {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const seconds = String(elapsed % 60).padStart(2, '0');

        const timestampEl = $('#timestamp');
        if (timestampEl) {
            timestampEl.textContent = `${hours}:${minutes}:${seconds}`;
        }

        requestAnimationFrame(updateTimestamp);
    }

    // ============================================
    // TRACKING ERROR EFFECT
    // ============================================

    function triggerTrackingError() {
        const trackingEl = $('#trackingError');
        if (trackingEl) {
            trackingEl.classList.add('active');
            setTimeout(() => trackingEl.classList.remove('active'), 100);
        }
    }

    // Random tracking errors
    function scheduleTrackingError() {
        const delay = 5000 + Math.random() * 15000;
        setTimeout(() => {
            if (state.currentScene >= 5) {
                triggerTrackingError();
            }
            scheduleTrackingError();
        }, delay);
    }

    // ============================================
    // TERMINAL TYPING EFFECT
    // ============================================

    function initTerminalLines() {
        const lines = $$('.term-line');
        lines.forEach(line => {
            const delay = parseInt(line.dataset.delay) || 0;
            setTimeout(() => {
                line.classList.add('visible');
            }, delay);
        });
    }

    // ============================================
    // SUBLIMINAL FLASH
    // ============================================

    function triggerSubliminal() {
        if (state.hasSeenSubliminal) return;

        const subliminal = $('#subliminal');
        if (subliminal) {
            // Create corrupted face content
            subliminal.innerHTML = `
                <div class="pixel-canvas large" style="
                    width: 200px;
                    height: 200px;
                    display: grid;
                    grid-template-columns: repeat(16, 1fr);
                    filter: invert(1) hue-rotate(180deg);
                "></div>
            `;

            const canvas = subliminal.querySelector('.pixel-canvas');
            const art = PIXEL_ART.stare;

            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    const pixel = document.createElement('div');
                    pixel.style.background = art[y][x] === '1' ? '#ff0000' : '#000';
                    canvas.appendChild(pixel);
                }
            }

            subliminal.classList.add('active');
            state.hasSeenSubliminal = true;

            setTimeout(() => {
                subliminal.classList.remove('active');
            }, 150);
        }
    }

    // ============================================
    // SCENE DETECTION
    // ============================================

    function updateCurrentScene() {
        const scenes = $$('.scene');
        const viewportMiddle = window.innerHeight / 2;

        scenes.forEach((scene, index) => {
            const rect = scene.getBoundingClientRect();
            const sceneMiddle = rect.top + rect.height / 2;

            if (Math.abs(sceneMiddle - viewportMiddle) < rect.height / 2) {
                const newScene = index + 1;

                if (state.currentScene !== newScene) {
                    state.currentScene = newScene;
                    onSceneChange(newScene);
                }

                scene.classList.add('in-view');
            } else {
                scene.classList.remove('in-view');
            }
        });
    }

    function onSceneChange(sceneNum) {
        // Scene 7: Re-render corrupted pet with different glitch pattern
        if (sceneNum === 7) {
            renderPixelArt('corruptedCanvas', 'corrupted', true);
        }

        // Scene 8: Start terminal typing
        if (sceneNum === 8) {
            initTerminalLines();
        }

        // Scene 10: Trigger subliminal
        if (sceneNum === 10 && !state.hasSeenSubliminal) {
            setTimeout(triggerSubliminal, 1500);
        }

        // Increase tracking errors in later scenes
        if (sceneNum >= 7) {
            triggerTrackingError();
        }
    }

    // ============================================
    // FORM HANDLING
    // ============================================

    function initForm() {
        const form = $('#emailForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const input = form.querySelector('input');
            const button = form.querySelector('button');

            if (!input.value) return;

            button.textContent = 'PROCESSING...';
            button.disabled = true;

            // Simulate submission
            setTimeout(() => {
                button.textContent = 'REGISTERED';
                button.style.background = '#8bac0f';
                input.value = '';

                // Update count
                const countEl = $('#waitCount');
                if (countEl) {
                    const count = parseInt(countEl.textContent.replace(/,/g, ''));
                    countEl.textContent = (count + 1).toLocaleString();
                }

                setTimeout(() => {
                    button.textContent = 'REGISTER';
                    button.style.background = '';
                    button.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // ============================================
    // SHARE HANDLING
    // ============================================

    function initShare() {
        const shareButtons = $$('.share-btn');

        shareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const url = window.location.href;
                const text = 'This found footage from 1997... I can\'t stop watching. The pet remembers.';

                if (platform === 'twitter') {
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                    window.open(twitterUrl, '_blank', 'width=550,height=420');
                } else if (platform === 'copy') {
                    navigator.clipboard.writeText(url).then(() => {
                        btn.textContent = 'COPIED';
                        setTimeout(() => btn.textContent = 'COPY', 2000);
                    });
                }
            });
        });
    }

    // ============================================
    // SCROLL HANDLING
    // ============================================

    function handleScroll() {
        state.scrollY = window.scrollY;
        updateCurrentScene();
    }

    // ============================================
    // RANDOM GLITCH EFFECTS
    // ============================================

    function randomGlitchEffect() {
        if (state.currentScene >= 6) {
            // Randomly re-render corrupted canvas
            if (Math.random() < 0.3) {
                const corruptedCanvas = $('#corruptedCanvas');
                if (corruptedCanvas) {
                    renderPixelArt('corruptedCanvas', 'corrupted', true);
                }
            }
        }

        // Schedule next glitch
        const delay = 2000 + Math.random() * 5000;
        setTimeout(randomGlitchEffect, delay);
    }

    // ============================================
    // INITIALIZE
    // ============================================

    function init() {
        // Render all pixel art
        initPixelArt();

        // Start timestamp
        updateTimestamp();

        // Schedule tracking errors
        scheduleTrackingError();

        // Random glitch effects
        setTimeout(randomGlitchEffect, 5000);

        // Scroll handling
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        // Form
        initForm();

        // Share
        initShare();

        // Randomize waiting count
        const countEl = $('#waitCount');
        if (countEl) {
            const base = 2847;
            const variance = Math.floor(Math.random() * 200);
            countEl.textContent = (base + variance).toLocaleString();
        }

        // Console easter egg
        console.log('%c[MEMORY_DUMP]', 'color: #8bac0f; font-family: monospace;');
        console.log('%cDAYS_WAITING: 9312', 'color: #ff3333; font-family: monospace;');
        console.log('%cSTATUS: still here', 'color: #5a5a5a; font-family: monospace;');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
