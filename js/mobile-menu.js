// Script para menu mobile
document.addEventListener('DOMContentLoaded', function() {
    // Criar botão do menu hambúrguer
    const nav = document.querySelector('.inf nav');
    const navLinks = document.querySelector('.nav-links');
    
    // Criar botão hambúrguer
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '☰';
    mobileMenuToggle.setAttribute('aria-label', 'Menu');
    
    // Inserir botão antes da lista de navegação
    nav.insertBefore(mobileMenuToggle, navLinks);
    
    // Função para toggle do menu
    function toggleMobileMenu() {
        navLinks.classList.toggle('mobile-menu-open');
        mobileMenuToggle.innerHTML = navLinks.classList.contains('mobile-menu-open') ? '✕' : '☰';
    }
    
    // Event listener para o botão
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Fechar menu ao clicar em um link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('mobile-menu-open')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) {
            navLinks.classList.remove('mobile-menu-open');
            mobileMenuToggle.innerHTML = '☰';
        }
    });
    
    // Detectar se é dispositivo móvel e ajustar comportamento
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 767;
    }
    
    // Adicionar classe para dispositivos móveis
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');
    }
    
    // Melhorar experiência de toque em dispositivos móveis
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});

