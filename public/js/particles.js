// Floating Particles Effect
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
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: hsl(${hue}, 100%, 60%);
            border-radius: 50%;
            left: ${posX}%;
            top: ${posY}%;
            box-shadow: 0 0 ${size}px hsl(${hue}, 100%, 60%);
            animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
            opacity: 0.5;
        `;
        
        container.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
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
        
        .particle {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
});

console.log('Particles loaded!');