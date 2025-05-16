function initMenuOnce() {
    const menuItems = document.querySelectorAll(".gc-account-user-menu .menu-item");
    if (!menuItems.length) return false; // если меню ещё не появилось — выходим

    // Здесь весь твой изначальный код из DOMContentLoaded:
    menuItems.forEach(item => {
        item.addEventListener("click", async function () {
            if (item.classList.contains("menu-item-profile") || item.classList.contains("menu-item-notifications_button_small")) {
                return;
            }

            const isAlreadySelected = item.classList.contains("select");
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

            if (link) {
                link.style.transition = "height 0.3s ease";
            }
            menuItem.style.transition = "height 0.3s ease";

            const submenuItems = submenu.querySelectorAll("li");
            submenuItems.forEach((submenuItem, index) => {
                setTimeout(() => {
                    submenuItem.style.transition = "opacity 0.2s, transform 0.2s";
                    submenuItem.style.opacity = 0;
                    submenuItem.style.transform = "translateY(-10px)";
                }, index * 50);
            });

            submenu.classList.remove("open");

            setTimeout(() => {
                if (link) {
                    link.style.height = '66px';
                }
                menuItem.style.height = '66px';
            }, 10);

            setTimeout(() => {
                submenu.style.display = "none";
                resetMenuItem(menuItem);
                menuItem.classList.remove("select");

                if (link) {
                    link.style.transition = "";
                }
                menuItem.style.transition = "";

                resolve();
            }, 300);
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

    return true; // успешная инициализация
}

// Запуск после загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
    if (initMenuOnce()) return;

    // Повторная попытка в течение 3 секунд каждые 10 мс
    const start = Date.now();
    const interval = setInterval(() => {
        if (initMenuOnce()) {
            clearInterval(interval);
        } else if (Date.now() - start > 3000) {
            clearInterval(interval);
            console.warn("Меню не найдено в течение 3 секунд");
        }
    }, 10);
});
