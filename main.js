
const eventsContainer = document.querySelector('#events');
const timelineContainer = document.querySelector('#timeline');
const visitDashboardContainer = document.querySelector('#visit-dashboard');
const viewSwitch = document.querySelector('#viewSwitch');

const rawFileInput = document.querySelector('#rawFileInput');
const parseStatus = document.querySelector('#parseStatus');
const filtersSearch = document.querySelector('#filters-search');

const availableFiltersContainer =
    document.querySelector('#availableFilters');

const usedFiltersContainer =
    document.querySelector('#usedFilters');

let parsedData = [];
let eventsData = [];

let filtersSearchText = '';
let activeFilters = [];
let availableFilterKeys = [];

function getFilteredEvents() {

    const selects =
        usedFiltersContainer.querySelectorAll(
            'select'
        );

    return eventsData.filter(event => {

        if (activeFilters.length && !Object.keys(event).some(item => activeFilters.includes(item))){
            return false;
        }

        for (const select of selects) {

            const key = select.dataset.key;
            const selectedValue = select.value;

            if (selectedValue === 'Any') {
                continue;
            }
            
            const eventValue = event[key];

            if (String(eventValue) !== selectedValue) {
                return false;
            }
        }

        return true;
    });
}

function renderDashBoard() {
    const filteredEvents =
        getFilteredEvents();
    const dashboard =
        document.createElement('div');
    dashboard.className = 'container';
    const stats = {};
    filteredEvents.forEach(event => {
        Object.keys(event).forEach(key => {
            stats[key] =
                (stats[key] || 0) + 1;
        });
    });
    const carousel =
        document.createElement('div');
    carousel.style.display = 'flex';
    carousel.style.gap = '12px';
    carousel.style.overflowX = 'auto';
    carousel.style.paddingBottom = '8px';
    carousel.appendChild(createDashBoardCard("Events", filteredEvents.length));
    Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([key, count]) => {
            carousel.appendChild(
                createDashBoardCard(
                    key,
                    count
                )
            );
        });
    dashboard.appendChild(carousel);
    eventsContainer.appendChild(
        dashboard
    );
}

function buildFilters(data) {
    availableFiltersContainer.innerHTML = '';
    usedFiltersContainer.innerHTML =
        'Drop filters here';
    activeFilters = [];
    if (!data.length) {
        return;
    }
    const keys = new Set();
    data.forEach(event => {
        Object.keys(event).forEach(key => {
            const value = event[key];
            if (
                value !== undefined &&
                value !== null &&
                typeof value !== 'object'
            ) {
                keys.add(key);
            }
        });
    });
    availableFilterKeys =
        [...keys].sort();
    renderAvailableFilters();
}

function renderAvailableFilters() {
    availableFiltersContainer.innerHTML = '';
    const normalizedSearch =
        filtersSearchText
            .trim()
            .toLowerCase();
    availableFilterKeys
        .filter(
            key =>
                !activeFilters.includes(key)
        )
        .filter(key => {
            if (!normalizedSearch) {
                return true;
            }
            return key
                .toLowerCase()
                .includes(normalizedSearch);
        })
        .forEach(key => {
            const chip =
                document.createElement('div');
            chip.className = 'filter-chip';
            chip.textContent = key;
            chip.draggable = true;
            chip.dataset.key = key;
            chip.addEventListener(
                'dragstart',
                (e) => {
                    chip.classList.add(
                        'dragging'
                    );
                    e.dataTransfer.setData(
                        'text/plain',
                        key
                    );
                }
            );
            chip.addEventListener(
                'dragend',
                () => {
                    chip.classList.remove(
                        'dragging'
                    );
                }
            );
            availableFiltersContainer
                .appendChild(chip);
        });
    // opcional:
    // mensaje cuando no hay resultados
    if (
        availableFiltersContainer
            .children.length === 0
    ) {
        availableFiltersContainer.innerHTML =
            `
            <p class="info">
                No filters found
            </p>
        `;
    }
}

function renderUsedFilters() {

    usedFiltersContainer.innerHTML = '';

    if (!activeFilters.length) {

        usedFiltersContainer.textContent =
            'Drop filters here';

        return;
    }

    activeFilters.forEach(key => {

        const wrapper =
            document.createElement('div');

        wrapper.className =
            'filter-select-wrapper';

        const label =
            document.createElement('label');

        label.textContent = key;

        const select =
            document.createElement('select');

        select.dataset.key = key;

        const anyOption =
            document.createElement('option');

        anyOption.value = 'Any';
        anyOption.textContent = 'Any';

        select.appendChild(anyOption);

        const values = new Set();

        eventsData.forEach(event => {

            const value = event[key];

            if (
                value !== undefined &&
                value !== null &&
                typeof value !== 'object'
            ) {
                values.add(String(value));
            }
        });

        [...values]
            .sort()
            .forEach(value => {

                const option =
                    document.createElement('option');

                option.value = value;
                option.textContent = value;

                select.appendChild(option);
            });
        
        select.addEventListener(
            'change',
            renderTimeline
        );
        
        select.addEventListener(
            'change',
            renderVisitDashboard
        );

        const removeBtn =
            document.createElement('button');

        removeBtn.innerHTML = '&times;';

        removeBtn.style.background =
            '#d32f2f';

        removeBtn.style.padding =
            '4px 8px';

        removeBtn.addEventListener(
            'click',
            () => {
                activeFilters =
                    activeFilters.filter(
                        filterKey =>
                            filterKey !== key
                    );
                renderAvailableFilters();
                renderUsedFilters();
                renderTimeline();
                renderVisitDashboard();
            }
        );

        wrapper.appendChild(label);
        wrapper.appendChild(select);
        wrapper.appendChild(removeBtn);

        usedFiltersContainer
            .appendChild(wrapper);
    });
}

filtersSearch.addEventListener(
    'input',
    (e) => {
        filtersSearchText =
            e.target.value;
        renderAvailableFilters();
    }
);

usedFiltersContainer.addEventListener(
    'dragover',
    (e) => {
        e.preventDefault();
    }
);

usedFiltersContainer.addEventListener(
    'drop',
    (e) => {
        e.preventDefault();
        const key =
            e.dataTransfer.getData(
                'text/plain'
            );
        if (!key) {
            return;
        }
        if (activeFilters.includes(key)) {
            return;
        }
        activeFilters.push(key);
        renderAvailableFilters();
        renderUsedFilters();
        renderTimeline();
        renderVisitDashboard();
    }
);

viewSwitch.addEventListener(
    'change',
    renderTimeline
);
viewSwitch.addEventListener(
    'change',
    renderVisitDashboard
);