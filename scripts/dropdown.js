/**
 * Creates a dropdown component from an array of objects.
 * @param {Array<{label: string, callback: Function}>} items 
 * @returns {HTMLElement} The root div of the dropdown
 */
function createDropdown({label, items}) {
    // 1. Create main container (Relative positioning is key for the absolute menu)
    const container = document.createElement('div');
    container.className = 'custom-dropdown';

    // 2. Create the Trigger Button
    const trigger = document.createElement('button');
    trigger.className = 'dropdown-trigger';
    trigger.innerHTML = `${label||"Actions"}`;
    container.appendChild(trigger);

    // 3. Create the Menu List
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu';

    // 4. Populate items
    items.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.className = 'dropdown-item';
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents the click from bubbling up
            item.callback();      // Run your custom logic
            menu.classList.remove('show'); // Close menu after selection
        });

        menu.appendChild(btn);
    });

    container.appendChild(menu);

    // 5. Toggle logic
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isVisible = menu.classList.toggle('show');
        // Optional: Force other dropdowns on the page to close if one opens
        if (isVisible) {
            document.querySelectorAll('.dropdown-menu').forEach(m => {
                if (m !== menu) m.classList.remove('show');
            });
        }
    });

    // 6. Close when clicking anywhere else on the screen
    document.addEventListener('click', () => {
        menu.classList.remove('show');
    });

    return container;
}
