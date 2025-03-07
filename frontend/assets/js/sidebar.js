function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const sidebarTexts = sidebar.querySelectorAll('.sidebar-text');
    const mainContent = document.getElementById('main-content');

    // Estado inicial: sidebar fechada
    let isOpen = false;

    // Alternar sidebar e ajustar o conteúdo principal
    toggleSidebarBtn.addEventListener('click', () => {
        if (isOpen) {
            sidebar.classList.remove('w-64');
            sidebar.classList.add('w-16');
            sidebarTexts.forEach(text => text.classList.add('hidden'));
            mainContent.style.marginLeft = '4rem'; // 4rem = w-16
        } else {
            sidebar.classList.remove('w-16');
            sidebar.classList.add('w-64');
            sidebarTexts.forEach(text => text.classList.remove('hidden'));
            mainContent.style.marginLeft = '16rem'; // 16rem = w-64
        }
        isOpen = !isOpen;
    });

    // Definir margem inicial do conteúdo principal
    mainContent.style.marginLeft = '4rem'; // Sidebar fechada por padrão

    // Destacar a página atual
    const currentPath = window.location.pathname;
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('bg-gray-700');
        }
    });
}