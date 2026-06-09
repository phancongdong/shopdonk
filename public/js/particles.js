// Floating Particles Effect - Antigravity Style
document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        const hue = Math.random() > 0.5 ? '180' : '270';
        
        particle.style.cssText = 
            position: absolute;
            width: px;
            height: px;
            background: hsl(, 100%, 60%);
            border-radius: 50%;
            left: %;
            top: %;
            box-shadow: 0 0 px hsl(, 100%, 60%);
            animation: floatParticle s ease-in-out s infinite;
            opacity: ;
        ;
        
        container.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = 
        @keyframes floatParticle {
            0%, 100% {
                transform: translateY(0) translateX(0) scale(1);
                opacity: 0.3;
            }
            25% {
                transform: translateY(-30px) translateX(20px) scale(1.2);
                opacity: 0.6;
            }
            50% {
                transform: translateY(-50px) translateX(-15px) scale(1);
                opacity: 0.8;
            }
            75% {
                transform: translateY(-20px) translateX(10px) scale(1.1);
                opacity: 0.5;
            }
        }
    ;
    document.head.appendChild(style);
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        
        particlesContainer.style.transform = 	ranslate(px, px);
    });
    
    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        particlesContainer.style.transform = 	ranslateY(px);
    });
});

// Glow effect on cards
document.querySelectorAll('.product-card, .ranking-card, .banner-main').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', ${x}px);
        card.style.setProperty('--mouse-y', ${y}px);
    });
});

console.log('Antigravity particles loaded!');
