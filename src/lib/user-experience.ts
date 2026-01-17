import { trackEvent } from './analytics';

// Отслеживание взаимодействия с интерфейсом
export function trackUserInteractions() {
  // Отслеживание кликов по кнопкам
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON') {
      trackEvent('button_click', {
        props: {
          buttonText: target.textContent,
          buttonType: target.getAttribute('type') || 'button',
          location: window.location.pathname
        }
      });
    }
  });

  // Отслеживание заполнения форм
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    trackEvent('form_submit', {
      props: {
        formId: form.id,
        formAction: form.action,
        location: window.location.pathname
      }
    });
  });

  // Отслеживание ошибок
  window.addEventListener('error', (e) => {
    trackEvent('error', {
      props: {
        message: e.message,
        filename: e.filename,
        lineNumber: e.lineno,
        columnNumber: e.colno
      }
    });
  });
}

// Улучшение доступности
export function enhanceAccessibility() {
  // Добавление ARIA-атрибутов
  document.querySelectorAll('button:not([aria-label])').forEach(button => {
    if (button instanceof HTMLButtonElement && button.textContent) {
      button.setAttribute('aria-label', button.textContent.trim());
    }
  });

  // Улучшение навигации с клавиатуры
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });
}

// Оптимизация форм
function enhanceFormExperience() {
  document.querySelectorAll('form').forEach(form => {
    // Автосохранение черновиков
    form.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.type !== 'password') {
        localStorage.setItem(`form_draft_${form.id}_${target.name}`, target.value);
      }
    });

    // Восстановление черновиков
    form.querySelectorAll('input, textarea').forEach(input => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        const savedValue = localStorage.getItem(`form_draft_${form.id}_${input.name}`);
        if (savedValue && input.type !== 'password') {
          input.value = savedValue;
        }
      }
    });

    // Валидация в реальном времени
    form.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      if (input.validationMessage) {
        showValidationMessage(input);
      }
    });
  });
}

function showValidationMessage(input: HTMLInputElement) {
  let message = input.validationMessage;
  const messageElement = document.createElement('div');
  messageElement.className = 'validation-message text-red-500 text-sm mt-1';
  messageElement.textContent = message;
  
  const existingMessage = input.parentElement?.querySelector('.validation-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  input.parentElement?.appendChild(messageElement);
}