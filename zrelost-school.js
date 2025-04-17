document.querySelectorAll('[class*="training-row"]').forEach(function(row, index) {
  const imageUrl = row.getAttribute('data-training-image');
  if (imageUrl) {
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : 'https:' + imageUrl;

    // Находим первую ячейку (td) в строке — или нужную тебе
    const firstTd = row.querySelector('td');
    if (!firstTd) return;

    // Добавляем класс и position: relative
    const uniqueClass = 'training-image-after-' + index;
    firstTd.classList.add(uniqueClass);
    firstTd.style.position = 'relative';

    // Создаем CSS
    const style = document.createElement('style');
    style.textContent = `
      .${uniqueClass}::after {
        content: '';
        position: absolute;
        top: 10px;
        right: 10px;
        width: 100px;
        height: 100px;
        background-image: url('${fullUrl}');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
  }
});



document.addEventListener("DOMContentLoaded", function () { 
    const menuItems = document.querySelectorAll(".gc-account-user-menu .menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", async function () {
            if (item.classList.contains("menu-item-profile") || item.classList.contains("menu-item-notifications_button_small")) {
                return;
            }

            const isAlreadySelected = item.classList.contains("select");

            // Плавно закрываем все открытые подменю
            await closeAllSubmenus();

            if (isAlreadySelected) return;

            item.classList.add("select");
            await waitForSubmenuLoad();
            await openSubmenu(item);
        });
    });

    async function closeAllSubmenus() {
        const promises = [];
        menuItems.forEach(el => {
            if (el.classList.contains("select")) {
                promises.push(closeSubmenu(el));
            } else {
                resetMenuItem(el);
            }
        });
        await Promise.all(promises);
    }

    async function closeSubmenu(menuItem) {
        return new Promise(resolve => {
            const submenu = menuItem.querySelector(".custom-submenu-bar");
            const link = menuItem.querySelector("a");
            
            if (!submenu) {
                resetMenuItem(menuItem);
                menuItem.classList.remove("select");
                return resolve();
            }

            // Добавляем transition для высоты
            if (link) {
                link.style.transition = "height 0.3s ease";
            }
            menuItem.style.transition = "height 0.3s ease";

            // Анимация закрытия пунктов подменю
            const submenuItems = submenu.querySelectorAll("li");
            submenuItems.forEach((submenuItem, index) => {
                setTimeout(() => {
                    submenuItem.style.transition = "opacity 0.2s, transform 0.2s";
                    submenuItem.style.opacity = 0;
                    submenuItem.style.transform = "translateY(-10px)";
                }, index * 50);
            });

            // Запускаем анимацию закрытия подложки
            submenu.classList.remove("open");

            // Устанавливаем конечную высоту
            setTimeout(() => {
                if (link) {
                    link.style.height = '66px';
                }
                menuItem.style.height = '66px';
            }, 10);

            // Ждем завершения анимации
            setTimeout(() => {
                submenu.style.display = "none";
                resetMenuItem(menuItem);
                menuItem.classList.remove("select");
                
                // Убираем transition после анимации
                if (link) {
                    link.style.transition = "";
                }
                menuItem.style.transition = "";
                
                resolve();
            }, 300); // Должно совпадать с временем анимации
        });
    }

    async function openSubmenu(menuItem) {
        const submenu = document.querySelector(".gc-account-user-submenu");
        if (!submenu) return;

        let newSubmenu = menuItem.querySelector(".custom-submenu-bar");
        const link = menuItem.querySelector("a");

        if (!newSubmenu) {
            const newSubmenuHTML = `
                <div class="custom-submenu-bar" style="margin-top: 10px; display: none;">
                    <ul class="custom-submenu"></ul>
                </div>
            `;
            menuItem.insertAdjacentHTML("beforeend", newSubmenuHTML);
            newSubmenu = menuItem.querySelector(".custom-submenu-bar");
        }

        const customSubmenu = newSubmenu.querySelector(".custom-submenu");
        customSubmenu.innerHTML = "";
        submenu.querySelectorAll("li").forEach(submenuItem => {
            const clonedItem = submenuItem.cloneNode(true);
            clonedItem.style.opacity = 0;
            clonedItem.style.transform = "translateY(-10px)";
            customSubmenu.appendChild(clonedItem);
        });

        newSubmenu.style.display = "block";

        // Добавляем transition для высоты
        if (link) {
            link.style.transition = "height 0.3s ease";
        }
        menuItem.style.transition = "height 0.3s ease";

        setTimeout(() => {
            newSubmenu.classList.add("open");
        }, 10);

        const submenuItems = customSubmenu.querySelectorAll("li");
        submenuItems.forEach((submenuItem, index) => {
            setTimeout(() => {
                submenuItem.style.transition = "opacity 0.3s, transform 0.3s";
                submenuItem.style.opacity = 1;
                submenuItem.style.transform = "translateY(0)";
            }, index * 100);
        });

        // Устанавливаем высоту после добавления контента
        setTimeout(() => {
            const submenuHeight = newSubmenu.scrollHeight;
            menuItem.style.height = `${submenuHeight + 12}px`;
            if (link) {
                link.style.height = `${submenuHeight + 12}px`;
            }
        }, 50);
    }

    function resetMenuItem(menuItem) {
        if (!menuItem.classList.contains("menu-item-profile") && !menuItem.classList.contains("menu-item-notifications_button_small")) {
            menuItem.style.height = '66px';
            const link = menuItem.querySelector("a");
            if (link) {
                link.style.height = '66px';
            }
        }
    }

    function waitForSubmenuLoad() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector(".gc-account-user-submenu")) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }
});






document.addEventListener("DOMContentLoaded", function () {
  // Наблюдаем за изменениями в DOM
  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        // Проверяем, появились ли нужные элементы
        const profileElement = document.querySelector(".gc-account-user-submenu-bar-profile");
        const notificationsElement = document.querySelector(".gc-account-user-submenu-bar-notifications_button_small");

        if (profileElement && !profileElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу profile
          addCloseButton(profileElement);
        }

        if (notificationsElement && !notificationsElement.querySelector(".close-button")) {
          // Добавляем крестик к элементу notifications
          addCloseButton(notificationsElement);
        }
      }
    }
  });

  // Указываем элемент, за которым следим
  const targetNode = document.querySelector("body");
  observer.observe(targetNode, { childList: true, subtree: true });

  // Функция добавления крестика
  function addCloseButton(parentElement) {
    const closeButton = document.createElement("div");
    closeButton.className = "close-button";
    closeButton.innerHTML = `
      <img 
        src="https://static.tildacdn.com/tild6566-6530-4235-a537-666432303963/close.svg" 
        alt="Закрыть" 
        style="width: 15px; height: 15px; cursor: pointer;" 
      />
    `;
    parentElement.prepend(closeButton);

    // Добавляем обработчик клика на крестик
    closeButton.addEventListener("click", function () {
      parentElement.style.display = "none";
    });
  }
});


// HTML-код для мобильной версии
const searchContainerHTMLMobile = `
  <div id="searchContainerMobile" style="position: relative; z-index: 1000; display: flex; align-items: center; background-color: white; border-radius: 20px; overflow: hidden; width: 40px; transition: width 0.3s ease;">
    <img src="https://static.tildacdn.com/tild3934-3633-4936-a333-663362386266/Search_Magnifying_Gl.svg" alt="Search" style="width: 20px; height: 20px; margin: 10px; cursor: pointer;">
    <input type="text" id="searchInputMobile" placeholder="Введите название тренинга или урока" style="border: none; outline: none; flex-grow: 1; padding: 5px; display: none;">
    <div id="searchResultsMobile" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background-color: white; border: 1px solid #ccc; border-radius: 5px; max-height: 200px; overflow-y: auto; z-index: 1001;"></div>
  </div>
`;

// HTML-код для десктопной версии
const searchContainerHTMLDesktop = `
  <div id="searchWrapper" style="width: 100%; background-color: #f8f8f8; padding: 10px; box-sizing: border-box;">
    <div id="searchContainer" style="position: relative; z-index: 1000; display: flex; align-items: center; background-color: white; border-radius: 20px; padding: 0 10px;">
      <img src="https://static.tildacdn.com/tild3934-3633-4936-a333-663362386266/Search_Magnifying_Gl.svg" alt="Search" style="width: 20px; height: 20px; margin-right: 10px;">
      <input type="text" id="searchInput" placeholder="Введите название тренинга или урока" style="border: none; outline: none; flex-grow: 1; color: #D2D2D2;">
      <div id="searchResults" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background-color: white; border: 1px solid #ccc; border-radius: 5px; max-height: 200px; overflow-y: auto; z-index: 1001;"></div>
    </div>
  </div>
`;

// Функция для добавления HTML-кода в нужные элементы
function addSearchContainer() {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    const mobileObserver = new MutationObserver(() => {
      const leftBar = document.querySelector('.gc-account-leftbar');

      if (leftBar && !leftBar.querySelector('#searchContainerMobile')) {
        leftBar.insertAdjacentHTML('afterbegin', searchContainerHTMLMobile);

        const searchContainer = document.getElementById('searchContainerMobile');
        const searchInput = document.getElementById('searchInputMobile');
        const searchIcon = searchContainer.querySelector('img');
        const searchResults = document.getElementById('searchResultsMobile');

        searchIcon.addEventListener('click', (event) => {
          event.stopPropagation();
          const isExpanded = searchContainer.style.width === '72vw';

          searchContainer.style.width = isExpanded ? '40px' : '72vw';
          searchInput.style.display = isExpanded ? 'none' : 'block';
          searchResults.style.display = 'none';
        });

        searchInput.addEventListener('input', () => {
          // Логика обновления результатов поиска
          searchResults.style.display = 'block';
          searchResults.innerHTML = `<p>Результаты для "${searchInput.value}"</p>`;
        });

        document.addEventListener('click', (event) => {
          if (!searchContainer.contains(event.target)) {
            searchContainer.style.width = '40px';
            searchInput.style.display = 'none';
            searchResults.style.display = 'none';
          }
        });
      }
    });

    mobileObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    const desktopObserver = new MutationObserver(() => {
      const mainContentUser = document.querySelector('.gc-main-content.gc-both-main-content.no-menu.account-page-content.with-left-menu.gc-user-logined.gc-user-user');
      const mainContentAdmin = document.querySelector('.gc-main-content.gc-both-main-content.wide.account-page-content.with-left-menu.gc-user-logined.gc-user-admin');

      const targetElement = mainContentUser || mainContentAdmin;

      if (targetElement && !targetElement.querySelector('#searchWrapper')) {
        targetElement.insertAdjacentHTML('afterbegin', searchContainerHTMLDesktop);

        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', () => {
          // Логика обновления результатов поиска
          searchResults.style.display = 'block';
          searchResults.innerHTML = `<p>Результаты для "${searchInput.value}"</p>`;
        });
      }
    });

    desktopObserver.observe(document.body, { childList: true, subtree: true });
  }
}

// Вызвать функцию для добавления контейнера
addSearchContainer();

// Обработчик для изменения размера окна
window.addEventListener('resize', () => {
  addSearchContainer();
});






document.addEventListener("DOMContentLoaded", function() {
$(document).ready(function () {
  let typingTimer;
  const typingDelay = 1000;

  // Определение, используется ли мобильная версия
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Функция для выполнения поиска
  function getData(searchStr, callback) {
    $.getJSON('/c/sa/search', { searchStr }, function (response) {
      if (response.success === true && Array.isArray(response.data.blocks)) {
        const results = response.data.blocks
          .filter(block => block.onClick?.url) // Учитываем только блоки с ссылкой
          .map(function (block) {
            const domain = window.location.origin;
            const fullUrl = domain + block.onClick.url;
            const isLesson = fullUrl.includes('lesson'); // Проверяем, содержит ли URL слово 'lesson'
            return {
              isLesson,
              title: block.title || "Без названия",
              description: block.description || "Нет описания",
              image: block.logo?.image || null,
              url: fullUrl
            };
          });
        callback(results);
      } else {
        callback([]);
      }
    });
  }

  // Рендеринг результатов поиска
  function renderResults(results, searchResults) {
    if (results.length > 0) {
      const lessons = results.filter(result => result.isLesson); // Уроки
      const trainings = results.filter(result => !result.isLesson); // Тренинги

      let resultItems = '';

      // Добавляем заголовок и элементы для тренингов
      if (trainings.length > 0) {
        resultItems += '<h2>Тренинги</h2>';
        resultItems += trainings.map(function (result) {
          return `
            <div class="result-item training-item">
              ${result.image ? `<img src="${result.image}" alt="Результат" />` : ""}
              <h3>${result.title}</h3>
              <p>${result.description}</p>
              <a href="${result.url}" target="_blank">Перейти</a>
            </div>
          `;
        }).join('');
      }

      // Добавляем заголовок и элементы для уроков
      if (lessons.length > 0) {
        resultItems += '<h2>Уроки</h2>';
        resultItems += lessons.map(function (result) {
          return `
            <div class="result-item lesson-item">
              ${result.image ? `<img src="${result.image}" alt="Результат" />` : ""}
              <h3>${result.title}</h3>
              <p>${result.description}</p>
              <a href="${result.url}" target="_blank">Перейти</a>
            </div>
          `;
        }).join('');
      }

      searchResults.html(resultItems);
    } else {
      searchResults.html('<p>Ничего не найдено.</p>');
    }

    searchResults.addClass('visible'); // Показываем блок
  }

  // Скрытие результатов при клике вне блока
  $(document).on('click', function (event) {
    const searchContainer = isMobile() ? $('#searchContainerMobile') : $('#searchContainer');
    const searchResults = isMobile() ? $('#searchResultsMobile') : $('#searchResults');

    if (!searchContainer.is(event.target) && searchContainer.has(event.target).length === 0) {
      searchResults.removeClass('visible');
    }
  });

  // Обработчик для поиска (и на ПК, и на мобильной версии)
  $(document).on('input', '#searchInput, #searchInputMobile', function () {
    clearTimeout(typingTimer);

    const searchInput = $(this);
    const searchResults = isMobile() ? $('#searchResultsMobile') : $('#searchResults');
    const searchStr = searchInput.val().trim();

    if (searchStr) {
      typingTimer = setTimeout(function () {
        getData(searchStr, function (results) {
          renderResults(results, searchResults);
        });
      }, typingDelay);
    } else {
      searchResults.removeClass('visible').empty();
    }
  });

  // Отслеживаем появление мобильных элементов
  $(document).on('click', '.search-icon', function () {
    setTimeout(function () {
      const searchInput = $('#searchInputMobile');
      if (searchInput.length > 0) {
        searchInput.trigger('focus'); // Автоматически ставим фокус
      }
    }, 300); // Ожидание перед проверкой, чтобы элементы успели подгрузиться
  });
});
});







// ======= Внешний вид уроков =======
// Этот блок стилизует элементы уроков
// ==========================================================
document.addEventListener("DOMContentLoaded", function () {
    let maxAttempts = 20;
    let attempts = 0;

    function processLessons() {
        // 1. Замена текста "Недоступен (стоп-урок)" на "Недоступен"
        document.querySelectorAll(".user-state-label.user-state-label-ex.is-stop-lesson").forEach(element => {
            if (element.textContent.trim() === "Недоступен (стоп-урок)") {
                element.textContent = "Недоступен";
            }
        });

        // 2. Добавление текста "Недоступен" туда, где его нет
        document.querySelectorAll("li.user-state-not_reached").forEach(item => {
            const vmiddleDiv = item.querySelector(".vmiddle");
            if (vmiddleDiv && !vmiddleDiv.querySelector(".user-state-label")) {
                const newLabel = document.createElement("div");
                newLabel.className = "user-state-label user-state-label-ex";
                newLabel.textContent = "Недоступен";
                vmiddleDiv.prepend(newLabel);
            }
        });

        // 3. Нумерация уроков (только тем, у кого есть .item-main-td)
        const tdElements = document.querySelectorAll('.lesson-list li table td.item-main-td');
        tdElements.forEach((td, index) => {
            const lessonNumber = index + 1;
            const lessonIdClass = 'lesson-id-' + lessonNumber;
            td.classList.add(lessonIdClass);

            if (!td.querySelector('.lesson-number')) {
                const afterElement = document.createElement('span');
                afterElement.textContent = "Урок №" + lessonNumber;
                afterElement.classList.add('lesson-number');
                td.appendChild(afterElement);
            }
        });
    }

    function waitForLessons() {
        const hasLessons = document.querySelectorAll('.lesson-list li').length > 0;

        if (hasLessons) {
            processLessons();

            // Подключаем наблюдатель на все lesson-list
            document.querySelectorAll('.lesson-list').forEach(list => {
                const observer = new MutationObserver(() => processLessons());
                observer.observe(list, { childList: true, subtree: true });
            });

        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(waitForLessons, 300);
        } else {
            console.warn("Уроки не были найдены вовремя.");
        }
    }

    waitForLessons();
});


  document.addEventListener("DOMContentLoaded", function () {
    const streamTitles = document.querySelectorAll('.stream-title');
    let moduleCount = 1;

    streamTitles.forEach((el, index) => {
      const descriptionDiv = el.parentElement.querySelector('div');

      if (descriptionDiv && descriptionDiv.textContent.includes('без модуля')) {
        // Удаляем "без модуля" из текста
        descriptionDiv.textContent = descriptionDiv.textContent.replace('без модуля', '').trim();
        return; // Пропускаем этот блок, не нумеруем
      }

      const className = `module-before-${moduleCount}`;
      el.classList.add(className);

      const style = document.createElement('style');
      style.textContent = `
        .${className} {
          position: relative;
        }

        .${className}::before {
          content: 'Модуль ${moduleCount}';
          position: absolute;
          top: -20px;
          left: 0;
          font-size: 16px;
          font-weight: bold;
          color: #6b4d1c;
        }
      `;
      document.head.appendChild(style);

      moduleCount++;
    });
  });


document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".user-state-label.user-state-label-ex");
    elements.forEach(element => {
        const text = element.textContent.trim();
        if (text === "Необходимо выполнить задание (стоп-урок)" || text === "Необходимо выполнить задание") {
            element.textContent = "Важное задание";
        }
    });
});
