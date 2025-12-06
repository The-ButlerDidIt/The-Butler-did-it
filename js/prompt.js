// =============================================
// Reusable Prompt Module 
// =============================================
const Prompt = (() => {
    const OVERLAY_ID = 'global-prompt-overlay';

    const ICONS = {
        info: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`,
        error: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`,
        success: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`,
        warning: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>`,
        confirm: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`
    };

    const COLORS = {
        info: {
            icon: 'text-accent',
            button: 'bg-accent hover:bg-accent-dim text-surface'
        },
        error: {
            icon: 'text-red-500',
            button: 'bg-red-500 hover:bg-red-600 text-white'
        },
        success: {
            icon: 'text-green-500',
            button: 'bg-green-500 hover:bg-green-600 text-white'
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'bg-yellow-500 hover:bg-yellow-600 text-surface'
        },
        confirm: {
            icon: 'text-accent',
            button: 'bg-accent hover:bg-accent-dim text-surface'
        }
    };

    function getOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-200';
        overlay.innerHTML = `
            <div id="prompt-box" class="w-full max-w-sm mx-4 bg-surface-light rounded-2xl shadow-2xl border border-white/10 transform scale-95 transition-transform duration-200">
                <div class="p-6">
                    <div class="flex items-start gap-4">
                        <div id="prompt-icon" class="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        </div>
                        <div class="flex-1 pt-1">
                            <h2 id="prompt-title" class="text-lg font-semibold text-white mb-1"></h2>
                            <p id="prompt-message" class="text-sm text-gray-400 leading-relaxed"></p>
                        </div>
                    </div>
                </div>
                <div id="prompt-actions" class="px-6 pb-6 flex justify-end gap-3">
                    <button id="prompt-cancel" class="hidden px-5 py-2.5 text-sm font-medium rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button id="prompt-confirm" class="px-5 py-2.5 text-sm font-medium rounded-xl transition-colors">
                        OK
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.dataset.backdropClicked = 'true';
            }
        });

        return overlay;
    }

    function show({ title, message, type = 'info', showCancel = false, confirmText = 'OK', cancelText = 'Cancel' }) {
        return new Promise(resolve => {
            const overlay = getOverlay();
            const box = overlay.querySelector('#prompt-box');
            const iconEl = overlay.querySelector('#prompt-icon');
            const titleEl = overlay.querySelector('#prompt-title');
            const messageEl = overlay.querySelector('#prompt-message');
            const confirmBtn = overlay.querySelector('#prompt-confirm');
            const cancelBtn = overlay.querySelector('#prompt-cancel');

            // Set content
            titleEl.textContent = title;
            messageEl.textContent = message;
            iconEl.innerHTML = ICONS[type] || ICONS.info;
            iconEl.className = `flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${COLORS[type]?.icon || COLORS.info.icon}`;
            
            // Set button styles
            confirmBtn.className = `px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${COLORS[type]?.button || COLORS.info.button}`;
            confirmBtn.textContent = confirmText;

            // Show/hide cancel button
            if (showCancel) {
                cancelBtn.classList.remove('hidden');
                cancelBtn.textContent = cancelText;
            } else {
                cancelBtn.classList.add('hidden');
            }

            // Show overlay with animation
            overlay.classList.remove('pointer-events-none', 'opacity-0');
            overlay.classList.add('opacity-100');
            box.classList.remove('scale-95');
            box.classList.add('scale-100');

            // Cleanup function
            const cleanup = (result) => {
                overlay.classList.add('opacity-0', 'pointer-events-none');
                overlay.classList.remove('opacity-100');
                box.classList.add('scale-95');
                box.classList.remove('scale-100');
                document.removeEventListener('keydown', keyHandler);
                confirmBtn.removeEventListener('click', confirmHandler);
                cancelBtn.removeEventListener('click', cancelHandler);
                overlay.removeEventListener('click', backdropHandler);
                resolve(result);
            };

            // Event handlers
            const confirmHandler = () => cleanup(true);
            const cancelHandler = () => cleanup(false);
            const backdropHandler = () => {
                if (overlay.dataset.backdropClicked === 'true') {
                    overlay.dataset.backdropClicked = 'false';
                    cleanup(false);
                }
            };
            const keyHandler = (e) => {
                if (e.key === 'Escape') cleanup(false);
                if (e.key === 'Enter') cleanup(true);
            };

            // Attach listeners
            confirmBtn.addEventListener('click', confirmHandler);
            cancelBtn.addEventListener('click', cancelHandler);
            overlay.addEventListener('click', backdropHandler);
            document.addEventListener('keydown', keyHandler);

            // Focus confirm button
            confirmBtn.focus();
        });
    }

    return {
        alert(message, title = 'Notice') {
            return show({ title, message, type: 'info' });
        },
        error(message, title = 'Error') {
            return show({ title, message, type: 'error' });
        },
        success(message, title = 'Success') {
            return show({ title, message, type: 'success' });
        },
        warning(message, title = 'Warning') {
            return show({ title, message, type: 'warning' });
        },
        confirm(message, title = 'Confirm') {
            return show({ 
                title, 
                message, 
                type: 'confirm', 
                showCancel: true, 
                confirmText: 'Yes', 
                cancelText: 'No' 
            });
        },
        custom(options) {
            return show(options);
        }
    };
})();