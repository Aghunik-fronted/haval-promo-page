
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
      lazy: { loadPrevNext: true },
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
  // 2. ИНТЕРАКТИВНОЕ ПЕРЕКЛЮЧЕНИЕ ЦВЕТОВ АВТОМОБИЛЕЙ В КАРТОЧКАХ
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
  // 3. ЛОГИКА БЕСКОНЕЧНОЙ ГАЛЕРЕИ ВСПЛЫВАЮЩИХ ОКОН ЧЕРЕЗ FANCYBOX 3
  // ==========================================================================
  const carImages = document.querySelectorAll('.car-slide__img');

  carImages.forEach(img => {
    img.style.cursor = 'pointer';

    img.addEventListener('click', function (e) {
      e.stopPropagation();

      const parentCard = this.closest('.car-slide');
      if (!parentCard) return;

      const allCarImages = parentCard.querySelectorAll('.car-slide__img:not([style*="display: none"])');
      const currentSrc = this.getAttribute('src');
      let startIndex = 0;

      const fancyboxImagesArray = [];

      allCarImages.forEach((carImg, index) => {
        const imgUrl = carImg.getAttribute('src');
        fancyboxImagesArray.push({
          src: imgUrl,
          type: 'image'
        });

        if (imgUrl === currentSrc) {
          startIndex = index;
        }
      });

      if (typeof window.jQuery !== 'undefined' && jQuery.fancybox) {
        jQuery.fancybox.open(fancyboxImagesArray, {
          index: startIndex,
          loop: true,
          infobar: true,
          buttons: ['zoom', 'close'],
          animationEffect: 'fade',
          transitionEffect: 'slide',
          thumbs: { autoStart: true }
        });
      } else {
        console.error('Критическая ошибка: Библиотека jQuery или FancyBox 3 не подключены на сайте!');
      }
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
      console.warn('Модальное окно с ID "phone-modal" не найдено в DOM');
      return;
    }

    const overlay = modal.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.close-btn');
    const form = document.getElementById('phone-form');
    const phoneInput = document.getElementById('user-phone');

    // Функция открытия модального окна
    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (phoneInput) phoneInput.focus();
      }, 300);
    }

    // Функция закрытия модального окна
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (phoneInput) phoneInput.value = '';
    }

    // Обработчик открытия модального окна по клику на кнопках
    const openButtons = document.querySelectorAll('[data-action="open-phone-modal"]');
    openButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
      });
    });

    // Обработчики закрытия (только если элементы существуют)
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Обработка отправки формы (только если форма существует)
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        const phoneValue = phoneInput?.value.trim();
        if (!phoneValue) {
          alert('Пожалуйста, введите номер телефона');
          return;
        }

        // Простая валидация номера телефона
        const phoneRegex = /^\+?[78][-(\s]?\(?\d{3}\)?[-(\s]?\d{3}[-(\s]?\d{2}[-(\s]?\d{2}$/;
        if (!phoneRegex.test(phoneValue)) {
          alert('Пожалуйста, введите корректный номер телефона');
          return;
        }

        // Отключаем кнопку и показываем состояние загрузки
        const submitBtn = form.querySelector('.btn-primary');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Отправляется...';

          // Отправка данных на сервер
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
            // Восстанавливаем кнопку после завершения запроса
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          });
        }
      });
    }
  }

  // Инициализация модального окна (один раз)
  initPhoneModal();
});