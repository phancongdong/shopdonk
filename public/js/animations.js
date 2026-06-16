(function() {
    'use strict';
    
    console.log('🎬 GSAP Animations script loaded');
    
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded. Animations disabled.');
        return;
    }
    
    console.log('✅ GSAP detected, initializing animations...');

    gsap.registerPlugin(ScrollTrigger);

    gsap.defaults({
        duration: 0.6,
        ease: "power2.out"
    });

    // Particles Background
    function initParticlesBackground() {
        var particlesContainer = document.getElementById('particles');
        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.id = 'particles';
            particlesContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden;';
            document.body.insertBefore(particlesContainer, document.body.firstChild);
        }

        for (var i = 0; i < 30; i++) {
            createParticle(particlesContainer, i);
        }
    }

    function createParticle(container, index) {
        var particle = document.createElement('div');
        particle.className = 'gsap-particle';
        
        var size = Math.random() * 6 + 2;
        var startX = Math.random() * 100;
        var startY = Math.random() * 100;
        var hue = Math.random() > 0.5 ? 240 : 270;
        
        particle.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;background:radial-gradient(circle, hsla(' + hue + ', 80%, 60%, 0.8) 0%, hsla(' + hue + ', 80%, 60%, 0) 70%);border-radius:50%;left:' + startX + '%;top:' + startY + '%;pointer-events:none;';
        
        container.appendChild(particle);
        
        gsap.to(particle, {
            y: -100 + Math.random() * 200,
            x: Math.random() * 50 - 25,
            opacity: 0.3,
            duration: Math.random() * 15 + 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: index * 0.2
        });
    }

    // Header Animation
    function initHeaderAnimation() {
        var header = document.querySelector('header');
        if (!header) return;

        gsap.from(header, {
            y: -50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });

        var logo = document.querySelector('.logo');
        if (logo) {
            gsap.from(logo, {
                x: -30,
                opacity: 0,
                duration: 0.6,
                delay: 0.2
            });
        }

        var navItems = document.querySelectorAll('.nav-menu a');
        if (navItems.length > 0) {
            gsap.from(navItems, {
                y: -20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.5,
                delay: 0.3
            });
        }

        var userBtn = document.querySelector('.user-btn');
        if (userBtn) {
            gsap.from(userBtn, {
                x: 30,
                opacity: 0,
                duration: 0.6,
                delay: 0.4
            });

            // User button hover
            var userBtnHoverTl = gsap.timeline({ paused: true });
            userBtnHoverTl.to(userBtn, {
                scale: 1.05,
                boxShadow: "0 8px 25px rgba(99, 102, 241, 0.4)",
                duration: 0.3,
                ease: "power2.out"
            });

            userBtn.addEventListener('mouseenter', function() { userBtnHoverTl.play(); });
            userBtn.addEventListener('mouseleave', function() { userBtnHoverTl.reverse(); });
        }

        // Scroll-triggered header
        var lastScrollY = 0;
        var headerHidden = false;
        
        window.addEventListener('scroll', function() {
            var currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                if (!header.classList.contains('scrolled')) {
                    header.classList.add('scrolled');
                    gsap.to(header, {
                        backgroundColor: 'rgba(26, 26, 46, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                        duration: 0.3
                    });
                }
                
                if (currentScrollY > lastScrollY + 50 && currentScrollY > 200 && !headerHidden) {
                    headerHidden = true;
                    gsap.to(header, { y: -80, duration: 0.3, ease: "power2.inOut" });
                }
                
                if (currentScrollY < lastScrollY && headerHidden) {
                    headerHidden = false;
                    gsap.to(header, { y: 0, duration: 0.3, ease: "power2.out" });
                }
            } else {
                if (header.classList.contains('scrolled')) {
                    header.classList.remove('scrolled');
                    gsap.to(header, {
                        backgroundColor: 'transparent',
                        backdropFilter: 'none',
                        boxShadow: 'none',
                        duration: 0.3
                    });
                }
                
                if (headerHidden) {
                    headerHidden = false;
                    gsap.to(header, { y: 0, duration: 0.3, ease: "power2.out" });
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Banner Animation
    function initBannerAnimation() {
        var bannerSection = document.querySelector('.banner-section');
        if (!bannerSection) return;

        gsap.from(bannerSection, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.5
        });

        var bannerImgs = document.querySelectorAll('.banner-img');
        bannerImgs.forEach(function(img, index) {
            gsap.from(img, {
                scale: 0.95,
                opacity: 0,
                duration: 1,
                delay: 0.6 + index * 0.2,
                ease: "power2.out"
            });
        });
    }

    // Category Cards
    function initCategoryCardsAnimation() {
        var categoryCards = document.querySelectorAll('.category-card');
        if (categoryCards.length === 0) return;

        gsap.set(categoryCards, { opacity: 0, y: 50 });

        ScrollTrigger.batch(categoryCards, {
            onEnter: function(batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 0.6,
                    ease: "power2.out"
                });
            },
            start: "top 85%",
            once: true
        });

        categoryCards.forEach(function(card) {
            var hoverTl = gsap.timeline({ paused: true });
            hoverTl.to(card, {
                scale: 1.02,
                boxShadow: "0 25px 50px rgba(99,102,241,0.3)",
                duration: 0.3,
                ease: "power2.out"
            });

            card.addEventListener('mouseenter', function() { hoverTl.play(); });
            card.addEventListener('mouseleave', function() { hoverTl.reverse(); });
        });
    }

    // Game Cards
    function initGameCardsAnimation() {
        var gameCards = document.querySelectorAll('.game-card');
        if (gameCards.length === 0) return;

        gsap.set(gameCards, { opacity: 0, y: 40 });

        ScrollTrigger.batch(gameCards, {
            onEnter: function(batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: { each: 0.1, from: "start" },
                    duration: 0.5,
                    ease: "power2.out"
                });
            },
            start: "top 90%",
            once: true
        });

        gameCards.forEach(function(card) {
            var img = card.querySelector('.game-img');
            var btn = card.querySelector('.game-btn');

            var hoverTl = gsap.timeline({ paused: true });
            hoverTl.to(card, {
                y: -8,
                duration: 0.3,
                ease: "power2.out"
            });

            if (img) {
                hoverTl.to(img, { scale: 1.05, duration: 0.3, ease: "power2.out" }, 0);
            }

            if (btn) {
                hoverTl.to(btn, { scale: 1.05, duration: 0.2, ease: "power2.out" }, 0);
            }

            card.addEventListener('mouseenter', function() { hoverTl.play(); });
            card.addEventListener('mouseleave', function() { hoverTl.reverse(); });
        });
    }

    // Section Titles
    function initSectionTitlesAnimation() {
        var sectionTitles = document.querySelectorAll('.section-title');
        if (sectionTitles.length === 0) return;

        gsap.set(sectionTitles, { opacity: 0, y: 30 });

        ScrollTrigger.batch(sectionTitles, {
            onEnter: function(batch) {
                gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.2,
                    duration: 0.6,
                    ease: "power2.out"
                });
            },
            start: "top 85%",
            once: true
        });
    }

    // Partner Section
    function initPartnerSectionAnimation() {
        var partnersGrid = document.querySelector('.partners-grid');
        if (!partnersGrid) return;

        var partnerItems = partnersGrid.querySelectorAll('.partner-item');
        if (partnerItems.length === 0) return;

        gsap.set(partnerItems, { opacity: 0, scale: 0.8 });

        ScrollTrigger.create({
            trigger: partnersGrid,
            start: "top 85%",
            onEnter: function() {
                gsap.to(partnerItems, {
                    opacity: 1,
                    scale: 1,
                    stagger: { each: 0.1, from: "center" },
                    duration: 0.5,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    }

    // Footer
    function initFooterAnimation() {
        var footer = document.querySelector('footer');
        if (!footer) return;

        gsap.from(footer, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: footer,
                start: "top 90%",
                once: true
            }
        });

        var footerSections = footer.querySelectorAll('.footer-section');
        if (footerSections.length > 0) {
            gsap.from(footerSections, {
                opacity: 0,
                y: 30,
                stagger: 0.15,
                duration: 0.6,
                scrollTrigger: {
                    trigger: footer,
                    start: "top 85%",
                    once: true
                }
            });
        }

        var socialLinks = footer.querySelectorAll('.social-links a');
        socialLinks.forEach(function(link) {
            var hoverTl = gsap.timeline({ paused: true });
            hoverTl.to(link, {
                y: -5,
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out"
            });

            link.addEventListener('mouseenter', function() { hoverTl.play(); });
            link.addEventListener('mouseleave', function() { hoverTl.reverse(); });
        });
    }

    // Chat Bubble
    function initChatBubbleAnimation() {
        var chatBubble = document.querySelector('.chat-bubble');
        if (!chatBubble) return;

        gsap.from(chatBubble, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            delay: 1,
            ease: "back.out(1.7)"
        });

        gsap.to(chatBubble, {
            scale: 1.1,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: 2
        });
    }

    // Scroll Progress
    function initScrollProgressIndicator() {
        var progressBar = document.createElement('div');
        progressBar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg, #6366f1, #8b5cf6);z-index:10001;transition:width 0.1s;';
        document.body.appendChild(progressBar);

        gsap.to(progressBar, {
            width: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3
            }
        });
    }

    // Button Animations
    function initButtonAnimations() {
        var buttons = document.querySelectorAll('.game-btn, .category-btn, .modal-btn.primary');
        
        buttons.forEach(function(btn) {
            var hoverTl = gsap.timeline({ paused: true });
            hoverTl.to(btn, {
                scale: 1.05,
                y: -2,
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
                duration: 0.3,
                ease: "power2.out"
            });

            btn.addEventListener('mouseenter', function() { hoverTl.play(); });
            btn.addEventListener('mouseleave', function() { hoverTl.reverse(); });
            
            btn.addEventListener('click', function() {
                gsap.to(btn, {
                    scale: 0.95,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            });
        });
    }

    // Modal Enhancement
    function enhanceModalAnimation() {
        var originalShowModal = window.showModal;
        if (!originalShowModal) return;

        window.showModal = function(type, title, content, buttons) {
            originalShowModal(type, title, content, buttons);

            var modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                gsap.fromTo(modalContent, {
                    scale: 0.8,
                    opacity: 0,
                    y: -30
                }, {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                });
            }

            var modalHeader = document.querySelector('.modal-header i');
            if (modalHeader) {
                gsap.from(modalHeader, {
                    scale: 0,
                    rotation: -180,
                    duration: 0.5,
                    ease: "back.out(2)"
                });
            }
        };

        var originalCloseModal = window.closeModal;
        if (originalCloseModal) {
            window.closeModal = function() {
                var modalContent = document.querySelector('.modal-content');
                if (modalContent) {
                    gsap.to(modalContent, {
                        scale: 0.8,
                        opacity: 0,
                        y: -30,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: function() { originalCloseModal(); }
                    });
                } else {
                    originalCloseModal();
                }
            };
        }
    }

    // Reduced Motion Support
    function initReducedMotionSupport() {
        var mediaQuery = gsap.matchMedia();
        
        mediaQuery.add("(prefers-reduced-motion: reduce)", function() {
            gsap.globalTimeline.timeScale(0);
            ScrollTrigger.getAll().forEach(function(st) { st.kill(); });
        });
    }

    // Init All
    function initAllAnimations() {
        initParticlesBackground();
        initHeaderAnimation();
        initBannerAnimation();
        initSectionTitlesAnimation();
        initCategoryCardsAnimation();
        initGameCardsAnimation();
        initPartnerSectionAnimation();
        initFooterAnimation();
        initChatBubbleAnimation();
        initScrollProgressIndicator();
        initButtonAnimations();
        initReducedMotionSupport();
        enhanceModalAnimation();
        
        ScrollTrigger.refresh();
    }

    // Observe Dynamic Content
    function observeDynamicContent() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            var newCards = node.querySelectorAll('.category-card, .game-card');
                            if (newCards.length > 0) {
                                gsap.from(newCards, {
                                    opacity: 0,
                                    y: 40,
                                    stagger: 0.1,
                                    duration: 0.5,
                                    ease: "power2.out"
                                });
                            }
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initAllAnimations, 100);
            observeDynamicContent();
        });
    } else {
        setTimeout(initAllAnimations, 100);
        observeDynamicContent();
    }

    window.addEventListener('load', function() {
        ScrollTrigger.refresh();
    });

    window.addEventListener('resize', function() {
        ScrollTrigger.refresh();
    });

    window.initGSAPAnimations = initAllAnimations;
    window.refreshGSAPAnimations = function() {
        initCategoryCardsAnimation();
        initGameCardsAnimation();
        initSectionTitlesAnimation();
        initButtonAnimations();
        ScrollTrigger.refresh();
    };

})();
