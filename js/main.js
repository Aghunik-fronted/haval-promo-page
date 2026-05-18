
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================================================
  // 1. ИНИЦИАЛИЗАЦИЯ И ЗАПУСК ОСНОВНОГО СЛАЙДЕРА КАТАЛОГА (НА ГЛАВНОЙ)
  // ==========================================================================
  let catalogSwiper;
  if (document.querySelector('.catalog__swiper')) {
  catalogSwiper = new Swiper('.catalog__swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoHeight: true,
    pagination: {
      el: '.catalog__swiper .swiper-pagination',
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 3
    },
    lazy: { loadPrevNext: true },
    navigation: {
      nextEl: '.catalog__swiper .swiper-button-next',
      prevEl: '.catalog__swiper .swiper-button-prev'
    },
    observer: true,
    observeParents: true,
    on: {
      init: function () {
        const el = this.el;
        if (el) {
          el.style.overflow = 'visible';
          const wrapper = el.querySelector('.swiper-wrapper');
          if (wrapper) wrapper.style.overflow = 'visible';
        }
      }
    }
  });
}

  // ==========================================================================
  // 2. Слайдер
  // ==========================================================================
const carImages = document.querySelectorAll('.car-slide__img');

carImages.forEach(img => {
    img.style.cursor = 'pointer';

    img.addEventListener('click', function () {
        const parentCard = this.closest('.car-slide');
        if (!parentCard) return;

        const allImagesInCard = parentCard.querySelectorAll('.car-slide__img');
        
        const items = Array.from(allImagesInCard).map(imageElement => ({
            src: imageElement.src, 
            type: 'image'
        }));

        const selectedIndex = Array.from(allImagesInCard).indexOf(this);

        Fancybox.show(items, {
            index: selectedIndex, 
            loop: true, 
            slideShow: false, 
            toolbar: "auto", 
            Thumbs: { autoStart: true } 
        });
    });
});

  // 3. ИНТЕРАКТИВНОЕ ПЕРЕКЛЮЧЕНИЕ ЦВЕТОВ АВТОМОБИЛЕЙ В КАРТОЧКАХ
  // ==========================================================================
  const slides = document.querySelectorAll('.car-slide');

  slides.forEach(slide => {
    const buttons = slide.querySelectorAll('.car-slide__color-btn');
    const images = slide.querySelectorAll('.car-slide__img');

    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        buttons.forEach(b => b.classList.remove('car-slide__color-btn--active'));
        this.classList.add('car-slide__color-btn--active');

        const chosenColor = this.getAttribute('data-color');
        if (!chosenColor) return;

        images.forEach(img => {
          if (img.getAttribute('data-color') === chosenColor) {
            img.classList.add('car-slide__img--active');
          } else {
            img.classList.remove('car-slide__img--active');
          }
        });

        if (catalogSwiper) {
          catalogSwiper.updateAutoHeight();
          setTimeout(() => catalogSwiper.updateAutoHeight(), 60);
        }
      });
    });
  });
  // ==========================================================================
  // 4. БЕЗОПАСНЫЙ СИНХРОНИЗАТОР ДЛЯ СТОРОННЕГО ТАЙМЕРА (СИНОБИ)
  // ==========================================================================
  let refreshCount = 0;
  const timerRefreshInterval = setInterval(() => {
    if (catalogSwiper) {
      catalogSwiper.update();
      catalogSwiper.updateAutoHeight();
    }
    refreshCount++;
    if (refreshCount > 5) {
      clearInterval(timerRefreshInterval);
    }
  }, 600);

  // ==========================================================================
  // 5. УПРАВЛЕНИЕ МОДАЛЬНЫМ ОКНОМ
  // ==========================================================================

  function initPhoneModal() {
  const modal = document.getElementById('phone-modal');
  if (!modal) {
    console.error('Модальное окно с ID "phone-modal" не найдено в DOM');
    return;
  }

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.close-btn');
  const form = document.getElementById('phone-form');
  const phoneInput = document.getElementById('user-phone');

  function openModal() {
    modal.style.display = 'block'; 
    setTimeout(() => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (phoneInput) {
        phoneInput.focus();
        phoneInput.value = '';
      }
    }, 10);
  }

  function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300); 
  }

  const openButtons = document.querySelectorAll('[data-action="open-phone-modal"]');
  openButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const phoneValue = phoneInput?.value.trim();
      if (!phoneValue) {
        alert('Пожалуйста, введите номер телефона');
        return;
      }

      const phoneRegex = /^\+?[78][-(\s]?\(?\d{3}\)?[-(\s]?\d{3}[-(\s]?\d{2}[-(\s]?\d{2}$/;
      if (!phoneRegex.test(phoneValue)) {
        alert('Пожалуйста, введите корректный номер телефона');
        return;
      }

      const submitBtn = form.querySelector('.btn-primary');
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляется...';

        fetch('/api/submit-phone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ phone: phoneValue })
        })
        .then(response => {
          if (!response.ok) throw new Error('Ошибка сети');
          return response.json();
        })
        .then(data => {
          console.log('Успешно отправлено:', data);
          alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
          closeModal();
        })
        .catch(error => {
          console.error('Ошибка отправки:', error);
          alert('Произошла ошибка. Попробуйте ещё раз.');
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
      }
    });
  }
}

  initPhoneModal();

    
    const burgerMenu = document.querySelector('.burger-menu');

  if (!burgerMenu) {
    console.error('❌ Элемент .burger-menu не найден в DOM');
    return;
  }

  console.log('✅ Бургер‑меню инициализировано через Fancybox');

  Fancybox.bind('[data-fancybox]', {
    dragToClose: false,
    closeExisting: true,
    transitionEffect: 'slide-in-out',
    transitionDuration: 366,
    on: {
        show: () => {
            const fancyboxContainer = document.querySelector('.fancybox__container');
            if (fancyboxContainer) {
                fancyboxContainer.style.justifyContent = 'flex-end'; // Прижимаем к правому краю
            }
        }
    }
  });
});


