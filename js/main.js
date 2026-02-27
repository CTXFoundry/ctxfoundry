/* ========================================
   CTX FOUNDRY — MAIN JAVASCRIPT
   ======================================== */

function onReady() {

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 50;

    function handleNavScroll() {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // ===== MOBILE NAV TOGGLE =====
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ===== INTERSECTION OBSERVER — FADE IN ON SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const animateElements = document.querySelectorAll(
        '.service-card, .process-step, .industry-card, .about-content, .about-visual, .contact-content, .contact-form-wrapper'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add visible style
    const style = document.createElement('style');
    style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);


    // ===== CONTACT FORM — HANDLING (no redirect) =====
    const contactForm = document.getElementById('contactForm');

    // Toast helpers
    function ensureToastContainer() {
        let c = document.getElementById('toastContainer');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toastContainer';
            c.className = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function showToast(message, type = 'success', timeout = 3000) {
        const container = ensureToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        // Auto-remove after timeout
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 250);
        }, timeout);
    }

    contactForm.addEventListener('submit', async function (e) {
        // Submit via fetch to avoid Formspree redirect and stay on-page
        e.preventDefault();
        const formData = new FormData(this);

        // Disable submit button while sending
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Clear inline error if present
        const existingErr = this.querySelector('.form-error');
        if (existingErr) existingErr.remove();

        try {
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Show success toast and reset form
                showToast("Thanks! We'll be in touch within 24 hours.", 'success');
                this.reset();
            } else {
                // Attempt to parse errors; otherwise show generic message
                let msg = 'We couldn\'t send your message. Please try again or email hello@ctxfoundry.com';
                try {
                    const data = await response.json();
                    if (data && data.errors && data.errors.length) {
                        msg = data.errors.map(e => e.message).join(', ');
                    }
                } catch (_) { /* ignore JSON parse errors */ }
                const err = document.createElement('p');
                err.className = 'form-error';
                err.textContent = msg;
                this.appendChild(err);
            }
        } catch (err) {
            const errMsg = document.createElement('p');
            errMsg.className = 'form-error';
            errMsg.textContent = 'Network error. Please try again or email hello@ctxfoundry.com';
            this.appendChild(errMsg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });


    // ===== CHATBOT WIDGET — GATED / ZERO API COST =====
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotBody = document.getElementById('chatbotBody');
    const chatbotInputArea = document.getElementById('chatbotInputArea');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');

    let chatState = 'initial'; // tracks conversation state

    // Toggle chatbot open/close
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.add('open');
        chatbotToggle.classList.add('hidden');
        if (chatState === 'initial') {
            startChat();
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('open');
        chatbotToggle.classList.remove('hidden');
    });

    // --- Chat message helpers ---
    function addBotMessage(text) {
        // Simulate AI response latency with a random typing delay between 1-5s.
        const useDelay = 1000 + Math.floor(Math.random() * 4001);
        return new Promise(resolve => {
            // Show typing indicator
            const typing = document.createElement('div');
            typing.className = 'chat-message bot typing';
            typing.innerHTML = '<span class="typing-text">Typing</span><span class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>';
            chatbotBody.appendChild(typing);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;

            setTimeout(() => {
                // Replace typing with actual message
                typing.remove();
                const msg = document.createElement('div');
                msg.className = 'chat-message bot';
                msg.textContent = text;
                chatbotBody.appendChild(msg);
                chatbotBody.scrollTop = chatbotBody.scrollHeight;
                resolve();
            }, useDelay);
        });
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chat-message user';
        msg.textContent = text;
        chatbotBody.appendChild(msg);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
    }

    function addOptions(options) {
        return new Promise(resolve => {
            setTimeout(() => {
                const container = document.createElement('div');
                container.className = 'chat-options';

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'chat-option-btn';
                    btn.textContent = opt.label;
                    btn.addEventListener('click', () => {
                        // Remove the options
                        container.remove();
                        // Show user's choice
                        addUserMessage(opt.label);
                        // Execute callback
                        opt.action();
                    });
                    container.appendChild(btn);
                });

                chatbotBody.appendChild(container);
                chatbotBody.scrollTop = chatbotBody.scrollHeight;
                resolve();
            }, 600);
        });
    }

    // --- Chat flow (RULE-BASED — zero API calls) ---
    async function startChat() {
        chatState = 'started';
        await addBotMessage("Hey there! 👋 Welcome to CTX Foundry.", 300);
        await addBotMessage("We can help point you in the right direction. What brings you here today?", 800);

        addOptions([
            {
                label: "🔍 I want to automate workflows with AI",
                action: () => handleInterest('automation')
            },
            {
                label: "📊 I need an AI strategy for my business",
                action: () => handleInterest('strategy')
            },
            
            {
                label: "🏢 I want a private/on-premise AI system",
                action: () => handleInterest('onprem')
            },
            {
                label: "👀 Just browsing",
                action: () => handleInterest('browsing')
            }
        ]);
    }

    async function handleInterest(type) {
        switch (type) {
            case 'automation':
                await addBotMessage("Great — workflow automation is our bread and butter. We typically start with a Revenue Automation Blueprint to identify which workflows will generate the most ROI.", 500);
                await addBotMessage("Most clients see measurable results within 90 days of their first build.", 800);
                await offerBooking();
                break;

            case 'strategy':
                await addBotMessage("Smart move. Our Revenue Automation Blueprint is a fixed-cost, deep-dive exploration of your operations.", 500);
                await addBotMessage("We map income-generating work and payroll-consuming tasks, then deliver a tangible plan you can execute — yours to keep regardless of next steps.", 800);
                await offerBooking();
                break;

            case 'pricing':
                await addBotMessage("We believe in transparency. Here's the general framework:", 500);
                await addBotMessage("• Revenue Automation Blueprint: $2,500–$5,000 (fixed cost)\n• Single Workflow Build: $5,000–$15,000\n• Full Build + Support: $2,500–$8,000/mo\n• On-Premise LLM: $25K–$75K+ (project)", 800);
                await addBotMessage("Every engagement starts with the Blueprint so we can scope accurately. No surprises.", 600);
                await offerBooking();
                break;

            case 'onprem':
                await addBotMessage("On-premise AI is our premium offering — ideal for firms handling sensitive data in legal, healthcare, or finance.", 500);
                await addBotMessage("We deploy fine-tuned LLMs on your infrastructure. Your data never leaves your network. Full sovereignty.", 800);
                await offerBooking();
                break;

            case 'browsing':
                await addBotMessage("No problem! Feel free to look around. If you want to chat later, I'll be right here. 🔥", 500);
                await addBotMessage("Quick tip: check out our Services section to see how we've structured our four-pillar approach.", 600);
                break;
        }
    }

    async function offerBooking() {
        await addBotMessage("Want to take the next step?", 600);
        addOptions([
            {
                label: "📅 Book a free discovery call",
                action: async () => {
                    await addBotMessage("Awesome! Just scroll down to our contact form and fill it out — we'll get back to you within 24 hours.", 400);
                    await addBotMessage("Or email us directly at hello@ctxfoundry.com", 600);
                    // Scroll to contact
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                }
            },
            {
                label: "💬 I have another question",
                action: async () => {
                    await addBotMessage("Sure! Type your question below and I'll do my best to help.", 400);
                    // Show the text input area
                    chatbotInputArea.style.display = 'flex';
                    chatbotInput.focus();
                }
            },
            {
                label: "👍 That's all for now",
                action: async () => {
                    await addBotMessage("Sounds good! We're here whenever you're ready. Have a great day! 🔥", 400);
                }
            }
        ]);
    }

    // --- Free text input handler (still rule-based, no API) ---
    function handleFreeText(text) {
        const lower = text.toLowerCase();

        if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
            addBotMessage("We tailor pricing to each engagement based on scope and outcomes.", 400).then(() => {
                addBotMessage("Happy to discuss specifics on a brief discovery call.", 600).then(() => {
                    offerBooking();
                });
            });
        } else if (lower.includes('automat') || lower.includes('workflow')) {
            handleInterest('automation');
        } else if (lower.includes('on-prem') || lower.includes('private') || lower.includes('llm') || lower.includes('on prem')) {
            handleInterest('onprem');
        } else if (lower.includes('audit') || lower.includes('strategy') || lower.includes('consult')) {
            handleInterest('strategy');
        } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            addBotMessage("Hey! 👋 How can I help you today? Feel free to ask about our services or process.", 400);
        } else {
            addBotMessage("Great question! That's one we'd love to cover on a discovery call so we can give you a thorough answer.", 400).then(() => {
                offerBooking();
            });
        }
    }

    // Send button
    chatbotSend.addEventListener('click', () => {
        const text = chatbotInput.value.trim();
        if (text) {
            addUserMessage(text);
            chatbotInput.value = '';
            handleFreeText(text);
        }
    });

    // Enter key
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            chatbotSend.click();
        }
    });
}

// Run immediately if DOM is ready (script is at end of body),
// otherwise attach to DOMContentLoaded for safety when loaded earlier.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
} else {
    onReady();
}
