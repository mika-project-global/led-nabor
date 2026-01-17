import React, { useState, useEffect } from 'react';

export function ScrollIndicator() {
  const [sections, setSections] = useState<{ id: string; label: string; top: number }[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const collectSections = () => {
      // Находим все заголовки h2 внутри основного контента
      const mainContent = document.querySelector('main, [class*="max-w-"]');
      if (!mainContent) return;
      
      const headings = Array.from(mainContent.querySelectorAll('h2')).filter(heading => {
        // Проверяем видимость заголовка
        const style = window.getComputedStyle(heading);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      const allSections = headings.map((heading, index) => {
        const id = heading.id || `section-${index}`;
        if (!heading.id) {
          heading.id = id;
        }

        return {
          id,
          label: heading.textContent || `Секция ${index + 1}`,
          top: Math.round(heading.getBoundingClientRect().top + window.scrollY)
        };
      });

      // Обновляем секции только если они действительно изменились
      setSections(prev => {
        const changed = allSections.length !== prev.length ||
          allSections.some((section, i) => 
            prev[i]?.id !== section.id || 
            Math.abs(prev[i]?.top - section.top) > 5
          );
        return changed ? allSections : prev;
      });

      setIsVisible(allSections.length > 1);
    };

    // Добавляем небольшую задержку для корректной инициализации
    const timer = setTimeout(collectSections, 100);

    // Наблюдаем за изменениями в DOM
    const observer = new MutationObserver((mutations) => {
      // Проверяем, есть ли значимые изменения
      const hasRelevantChanges = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
          node instanceof HTMLElement && (
            node.tagName === 'H2' || 
            node.querySelector('h2')
          )
        )
      );
      
      if (hasRelevantChanges) {
        collectSections();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener('load', collectSections);
    window.addEventListener('resize', collectSections);
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('load', collectSections);
      window.removeEventListener('resize', collectSections);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Добавляем смещение для более раннего переключения секций
      const scrollPosition = Math.round(window.scrollY + window.innerHeight * 0.25);
      
      if (sections.length > 0) {
        let activeSection = sections[0];
        
        // Находим последнюю секцию, до которой дошел скролл
        for (const section of sections) {
          if (scrollPosition >= section.top) {
            activeSection = section;
          } else {
            break;
          }
        }
        
        setActiveSection(activeSection.id);
      }
    };

    // Используем throttle для оптимизации производительности
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    handleScroll(); // Вызываем сразу для определения начальной секции

    return () => window.removeEventListener('scroll', scrollListener);
  }, [sections]);

  if (!isVisible) return null;

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
      <ul className="space-y-3">
        {sections.map((section) => (
          <li key={section.id} className="relative">
            <button
              onClick={() => {
                const element = document.getElementById(section.id);
                if (element) {
                  const offset = window.innerHeight * 0.25;
                  const top = element.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({
                    top,
                    behavior: 'smooth'
                  });
                }
              }}
              className="block w-2 h-2 transition-all duration-300 relative"
              title={section.label}
            >
              <div
                className={`w-full h-full rounded-full transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-cyan-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}