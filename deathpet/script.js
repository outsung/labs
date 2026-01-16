/**
 * DEATHPET - Viral Landing Page
 * Scroll-based storytelling with horror elements
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================

    const CONFIG = {
        scrollStopDelay: 2500,      // ms before showing "why did you stop"
        dayCounterSpeed: 100,       // ms between day increments
        jumpscareChance: 0.7,       // probability of jumpscare in scene 7
        glitchDuration: 300,        // ms for glitch effect
        shareTexts: {
            twitter: '방금 DEATHPET 랜딩 보고 소름 돋았다... 스크롤 멈추지 마세요 👁️',
            facebook: '귀여운 펫 게임인 줄 알았는데... 직접 확인해봐'
        }
    };

    // ============================================
    // State
    // ============================================

    const state = {
        currentScene: 1,
        scrollProgress: 0,
        isScrollStopped: false,
        scrollStopTimer: null,
        hasTriggeredJumpscare: false,
        dayCount: 7,
        isInHorrorSection: false,
        lastScrollY: 0
    };

    // ============================================
    // DOM Elements
    // ============================================

    const elements = {
        progressBar: document.querySelector('.progress-bar'),
        scrollStopOverlay: document.getElementById('scrollStopOverlay'),
        glitchOverlay: document.getElementById('glitchOverlay'),
        dayCounter: document.getElementById('dayCounter'),
        jumpscareContainer: document.getElementById('jumpscareContainer'),
        hiddenWatcher: document.getElementById('hiddenWatcher'),
        emailForm: document.getElementById('emailForm'),
        waitingCount: document.getElementById('waitingCount'),
        scenes: document.querySelectorAll('.scene'),
        memories: document.querySelectorAll('.memory')
    };

    // ============================================
    // Scroll Handler
    // ============================================

    function handleScroll() {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollY / maxScroll, 1);

        state.scrollProgress = progress;
        state.lastScrollY = scrollY;

        // Update progress bar
        updateProgressBar(progress);

        // Determine current scene
        updateCurrentScene(scrollY);

        // Reset scroll stop timer
        resetScrollStopTimer();

        // Scene-specific effects
        handleSceneEffects(progress);
    }

    function updateProgressBar(progress) {
        elements.progressBar.style.width = `${progress * 100}%`;

        // Change color based on progress
        if (progress > 0.6) {
            elements.progressBar.style.background = 'linear-gradient(90deg, #ff3333, #660000)';
        } else if (progress > 0.3) {
            elements.progressBar.style.background = 'linear-gradient(90deg, #999, #666)';
        }
    }

    function updateCurrentScene(scrollY) {
        elements.scenes.forEach((scene, index) => {
            const rect = scene.getBoundingClientRect();
            const sceneMiddle = rect.top + rect.height / 2;

            if (sceneMiddle > 0 && sceneMiddle < window.innerHeight) {
                const sceneNum = index + 1;
                if (state.currentScene !== sceneNum) {
                    state.currentScene = sceneNum;
                    onSceneChange(sceneNum);
                }
            }
        });
    }

    function onSceneChange(sceneNum) {
        // Update body class for dark mode
        if (sceneNum >= 5) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Track if in horror section
        state.isInHorrorSection = sceneNum >= 5 && sceneNum <= 7;

        // Scene-specific triggers
        switch (sceneNum) {
            case 2:
                animateMemories();
                break;
            case 4:
                startDayCounter();
                break;
            case 5:
                triggerScreenShake();
                break;
            case 7:
                setupJumpscare();
                break;
        }
    }

    // ============================================
    // Scroll Stop Detection
    // ============================================

    function resetScrollStopTimer() {
        // Hide overlay if visible
        if (state.isScrollStopped) {
            hideScrollStopOverlay();
        }

        // Clear existing timer
        if (state.scrollStopTimer) {
            clearTimeout(state.scrollStopTimer);
        }

        // Only trigger in horror sections
        if (state.isInHorrorSection) {
            state.scrollStopTimer = setTimeout(onScrollStop, CONFIG.scrollStopDelay);
        }
    }

    function onScrollStop() {
        if (!state.isInHorrorSection) return;

        state.isScrollStopped = true;
        showScrollStopOverlay();

        // Position the watcher near cursor or random position
        positionWatcher();
    }

    function showScrollStopOverlay() {
        elements.scrollStopOverlay.classList.add('visible');
        triggerGlitch(100);
    }

    function hideScrollStopOverlay() {
        elements.scrollStopOverlay.classList.remove('visible');
        state.isScrollStopped = false;
    }

    function positionWatcher() {
        const watcher = elements.hiddenWatcher;
        const positions = [
            { top: '20%', left: '10%' },
            { top: '30%', right: '10%' },
            { top: '70%', left: '15%' },
            { top: '60%', right: '15%' },
            { top: '80%', left: '50%' }
        ];

        const pos = positions[Math.floor(Math.random() * positions.length)];
        Object.assign(watcher.style, {
            top: pos.top || 'auto',
            bottom: pos.bottom || 'auto',
            left: pos.left || 'auto',
            right: pos.right || 'auto'
        });

        watcher.classList.add('visible');
        setTimeout(() => watcher.classList.remove('visible'), 2000);
    }

    // ============================================
    // Scene Effects
    // ============================================

    function handleSceneEffects(progress) {
        // Scene 3-4: Background darkening
        if (progress > 0.2 && progress < 0.5) {
            const darkenProgress = (progress - 0.2) / 0.3;
            const gray = Math.floor(232 - darkenProgress * 100);
            document.body.style.background = `rgb(${gray}, ${gray - 4}, ${gray - 8})`;
        }

        // Scene 4: Day counter updates
        if (state.currentScene === 4) {
            const scene4Progress = getSceneProgress(4);
            updateDayDisplay(scene4Progress);
        }

        // Scene 5: Increasing tension
        if (state.currentScene === 5) {
            const scene5Progress = getSceneProgress(5);
            if (scene5Progress > 0.7) {
                document.querySelector('.scene-5')?.classList.add('shaking');
                setTimeout(() => {
                    document.querySelector('.scene-5')?.classList.remove('shaking');
                }, 500);
            }
        }
    }

    function getSceneProgress(sceneNum) {
        const scene = document.querySelector(`.scene-${sceneNum}`);
        if (!scene) return 0;

        const rect = scene.getBoundingClientRect();
        const sceneStart = -rect.height;
        const sceneEnd = window.innerHeight;
        const progress = (sceneEnd - rect.top) / (sceneEnd - sceneStart);

        return Math.max(0, Math.min(1, progress));
    }

    // ============================================
    // Memory Animation (Scene 2)
    // ============================================

    function animateMemories() {
        elements.memories.forEach((memory, index) => {
            setTimeout(() => {
                memory.classList.add('visible');
            }, index * 300);
        });
    }

    // ============================================
    // Day Counter (Scene 4)
    // ============================================

    let dayInterval = null;

    function startDayCounter() {
        if (dayInterval) return;

        state.dayCount = 7;
        updateDayCounterDisplay();

        dayInterval = setInterval(() => {
            if (state.currentScene !== 4) {
                clearInterval(dayInterval);
                dayInterval = null;
                return;
            }

            if (state.dayCount < 30) {
                state.dayCount += Math.floor(Math.random() * 3) + 1;
                if (state.dayCount > 30) state.dayCount = 30;
                updateDayCounterDisplay();
            }
        }, CONFIG.dayCounterSpeed * 10);
    }

    function updateDayCounterDisplay() {
        const dayNumber = elements.dayCounter?.querySelector('.day-number');
        if (dayNumber) {
            dayNumber.textContent = `Day ${state.dayCount}`;
            dayNumber.style.color = state.dayCount > 20 ? '#cc4444' : '';
        }
    }

    function updateDayDisplay(progress) {
        const days = [7, 14, 21, 30];
        const index = Math.min(Math.floor(progress * days.length), days.length - 1);
        state.dayCount = days[index];
        updateDayCounterDisplay();
    }

    // ============================================
    // Screen Shake (Scene 5)
    // ============================================

    function triggerScreenShake() {
        const scene5 = document.querySelector('.scene-5');
        if (scene5) {
            scene5.classList.add('shaking');
            setTimeout(() => scene5.classList.remove('shaking'), 500);
        }
    }

    // ============================================
    // Jumpscare (Scene 7)
    // ============================================

    function setupJumpscare() {
        if (state.hasTriggeredJumpscare) return;

        // Random chance to trigger
        if (Math.random() < CONFIG.jumpscareChance) {
            const delay = 2000 + Math.random() * 3000;
            setTimeout(triggerJumpscare, delay);
        }
    }

    function triggerJumpscare() {
        if (state.hasTriggeredJumpscare || state.currentScene !== 7) return;

        state.hasTriggeredJumpscare = true;

        // Show jumpscare
        elements.jumpscareContainer.classList.add('active');
        triggerGlitch(CONFIG.glitchDuration);

        // Play sound if available
        playGlitchSound();

        // Hide after animation
        setTimeout(() => {
            elements.jumpscareContainer.classList.remove('active');
        }, CONFIG.glitchDuration);
    }

    // ============================================
    // Glitch Effect
    // ============================================

    function triggerGlitch(duration = CONFIG.glitchDuration) {
        elements.glitchOverlay.classList.add('active');
        setTimeout(() => {
            elements.glitchOverlay.classList.remove('active');
        }, duration);
    }

    // ============================================
    // Audio
    // ============================================

    function playGlitchSound() {
        const audio = document.getElementById('glitchAudio');
        if (audio && audio.src) {
            audio.currentTime = 0;
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    // ============================================
    // Email Form
    // ============================================

    function handleFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const button = form.querySelector('button');

        if (!email) return;

        // Disable button
        button.disabled = true;
        button.textContent = '등록 중...';

        // Simulate form submission (replace with actual Formspree endpoint)
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                button.textContent = '등록 완료!';
                button.style.background = '#4CAF50';
                form.querySelector('input').value = '';
                incrementWaitingCount();
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(() => {
            // Still show success for demo purposes
            button.textContent = '등록 완료!';
            button.style.background = '#4CAF50';
            form.querySelector('input').value = '';
            incrementWaitingCount();
        })
        .finally(() => {
            setTimeout(() => {
                button.disabled = false;
                button.textContent = '등록하기';
                button.style.background = '';
            }, 3000);
        });
    }

    function incrementWaitingCount() {
        const countEl = elements.waitingCount;
        if (countEl) {
            const currentCount = parseInt(countEl.textContent.replace(/,/g, ''));
            const newCount = currentCount + 1;
            countEl.textContent = newCount.toLocaleString();
        }
    }

    // ============================================
    // Share Buttons
    // ============================================

    function handleShare(e) {
        const button = e.target.closest('.share-btn');
        if (!button) return;

        const platform = button.dataset.platform;
        const url = window.location.href;

        switch (platform) {
            case 'twitter':
                shareToTwitter(url);
                break;
            case 'facebook':
                shareToFacebook(url);
                break;
            case 'copy':
                copyToClipboard(url);
                break;
        }
    }

    function shareToTwitter(url) {
        const text = encodeURIComponent(CONFIG.shareTexts.twitter);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    function shareToFacebook(url) {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=550,height=420');
    }

    function copyToClipboard(url) {
        navigator.clipboard.writeText(url).then(() => {
            const button = document.querySelector('.share-btn.copy');
            const originalHTML = button.innerHTML;
            button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
            setTimeout(() => {
                button.innerHTML = originalHTML;
            }, 2000);
        });
    }

    // ============================================
    // Pet Eye Tracking
    // ============================================

    function handleMouseMove(e) {
        const pupils = document.querySelectorAll('.pupil:not(.looking-up):not(.small):not(.dilating)');

        pupils.forEach(pupil => {
            const eye = pupil.closest('.eye');
            if (!eye) return;

            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const distance = Math.min(3, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 50);

            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    }

    // ============================================
    // Intersection Observer for Animations
    // ============================================

    function setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');

                    // Trigger typing animations
                    const typingElements = entry.target.querySelectorAll('.typing');
                    typingElements.forEach(el => {
                        el.style.animationPlayState = 'running';
                    });
                }
            });
        }, observerOptions);

        elements.scenes.forEach(scene => observer.observe(scene));
    }

    // ============================================
    // Keyboard Accessibility
    // ============================================

    function handleKeydown(e) {
        // Space or Enter to scroll down
        if (e.key === ' ' || e.key === 'Enter') {
            if (document.activeElement === document.body) {
                e.preventDefault();
                window.scrollBy({
                    top: window.innerHeight * 0.8,
                    behavior: 'smooth'
                });
            }
        }

        // Escape to close overlays
        if (e.key === 'Escape') {
            hideScrollStopOverlay();
        }
    }

    // ============================================
    // Touch Support
    // ============================================

    let touchStartY = 0;

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY;

        // Reset scroll stop timer on touch move
        if (Math.abs(diff) > 5) {
            resetScrollStopTimer();
        }
    }

    // ============================================
    // Initialize
    // ============================================

    function init() {
        // Scroll handler with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Mouse tracking for pet eyes
        document.addEventListener('mousemove', handleMouseMove);

        // Form submission
        if (elements.emailForm) {
            elements.emailForm.addEventListener('submit', handleFormSubmit);
        }

        // Share buttons
        document.querySelector('.share-buttons')?.addEventListener('click', handleShare);

        // Keyboard
        document.addEventListener('keydown', handleKeydown);

        // Touch
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Intersection observer
        setupIntersectionObserver();

        // Initial state
        handleScroll();

        // Randomize waiting count slightly
        if (elements.waitingCount) {
            const baseCount = 2847;
            const variance = Math.floor(Math.random() * 100);
            elements.waitingCount.textContent = (baseCount + variance).toLocaleString();
        }

        // Console easter egg
        console.log('%c👁️ DEATHPET is watching...', 'color: #ff3333; font-size: 20px; font-weight: bold;');
        console.log('%cDon\'t leave your pet alone.', 'color: #666; font-size: 14px;');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
