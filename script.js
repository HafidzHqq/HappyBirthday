setTimeout(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.add('show');
    }
}, 4000);

setTimeout(() => {
    const getBtn = document.getElementById('Get');
    if (getBtn) {
        getBtn.classList.add('show');
    }
}, 4000);


document.querySelectorAll(".link").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const url = link.href;

        document.body.classList.add("fade-out");

        setTimeout(() => {
            window.location.href = url;
        }, 500);
    });
});


// Music sync across pages with localStorage
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');

if (musicBtn && bgMusic) {
    const playIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
    const pauseIcon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';

    const updateButton = (isPlaying) => {
        musicBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
        musicBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    };

    updateButton(false);
    bgMusic.load(); // ensure the source is ready

    // Load music state from localStorage
    const musicState = localStorage.getItem('musicPlaying') === 'true';
    let pendingResume = false; // if autoplay gets blocked, retry on next tap

    const playAudio = (fromGesture = false) => {
        try {
            const savedTime = parseFloat(localStorage.getItem('musicTime') || '0');
            if (!Number.isNaN(savedTime) && savedTime > 0 && bgMusic.currentTime === 0) {
                bgMusic.currentTime = savedTime;
            }

            const promise = bgMusic.play(); // must be called in gesture context when available
            if (promise && typeof promise.then === 'function') {
                promise.then(() => {
                    updateButton(true);
                    localStorage.setItem('musicPlaying', 'true');
                    pendingResume = false;
                }).catch(err => {
                    // If not from a gesture, keep waiting; if from gesture, surface the error
                    console.warn(fromGesture ? 'Play failed on gesture' : 'Play blocked, waiting for gesture', err);
                    pendingResume = true;
                });
            }
        } catch (err) {
            console.error('Unexpected play error', err);
            pendingResume = true;
        }
    };

    if (musicState) {
        playAudio(false);
    }

    const attemptResume = () => {
        if (!pendingResume) return;
        playAudio(true);
    };

    document.addEventListener('pointerdown', attemptResume, { once: false });

    // Keep button in sync with actual audio events
    bgMusic.addEventListener('play', () => updateButton(true));
    bgMusic.addEventListener('pause', () => updateButton(false));

    // Update localStorage every second
    setInterval(() => {
        if (!bgMusic.paused) {
            localStorage.setItem('musicTime', bgMusic.currentTime.toString());
        }
    }, 1000);

    // Toggle music
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            playAudio(true);
        } else {
            bgMusic.pause();
            updateButton(false);
            localStorage.setItem('musicPlaying', 'false');
            localStorage.setItem('musicTime', bgMusic.currentTime.toString());
        }
    });

    // Save state before page unload
    window.addEventListener('beforeunload', () => {
        if (!bgMusic.paused) {
            localStorage.setItem('musicTime', bgMusic.currentTime.toString());
            localStorage.setItem('musicPlaying', 'true');
        }
    });
}

