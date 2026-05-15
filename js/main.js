document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Запуск слайдера Swiper из ТЗ
    const catalogSwiper = new Swiper('.catalog__swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: false,
        autoHeight: true,
        
        preloadImages: false, 
        lazy: true,           
        
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // 2. Логика переключения цветов машин
    const colorContainers = document.querySelectorAll('.car-slide__colors');
    
    colorContainers.forEach(container => {
        const targetImgId = container.getAttribute('data-target');
        if (!targetImgId) return; // Защита: если забыли атрибут в HTML, скрипт не упадет
        
        const targetImg = document.getElementById(targetImgId);
        const buttons = container.querySelectorAll('.car-slide__color-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function () {
                buttons.forEach(b => b.classList.remove('car-slide__color-btn--active'));
                this.classList.add('car-slide__color-btn--active');
                
                const newImgPath = this.getAttribute('data-image');
                if (targetImg && newImgPath) {
                    targetImg.src = newImgPath;
                }
            });
        });
    });

});