function renderEvents() {
    eventsContainer.innerHTML = '';
    renderDashBoard();
    const showTable = viewSwitch.checked;
    const filteredEvents =
        getFilteredEvents();
    filteredEvents.forEach(event => {

        const card =
            document.createElement('div');

        card.className = 'event-card';

        const actions =
            document.createElement('div');

        actions.className = 'event-actions';

        const copyJsonBtn =
            document.createElement('button');

        copyJsonBtn.textContent =
            'Copy JSON';

        copyJsonBtn.addEventListener(
            'click',
            () => {
                copyToClipboard(
                    JSON.stringify(event, null, 2)
                );
            }
        );

        const copyTableBtn =
            document.createElement('button');

        copyTableBtn.textContent =
            'Copy Table';

        copyTableBtn.addEventListener(
            'click',
            () => {
                copyToClipboard(
                    createTSV(event)
                );
            }
        );

        actions.appendChild(copyJsonBtn);
        actions.appendChild(copyTableBtn);

        const preView =
            document.createElement('div');

        preView.className =
            showTable ? 'hidden' : '';

        const pre =
            document.createElement('pre');

        pre.textContent =
            JSON.stringify(event, null, 2);

        preView.appendChild(pre);

        const tableView =
            document.createElement('div');

        tableView.className =
            showTable ? '' : 'hidden';

        tableView.appendChild(
            createTable(event)
        );

        card.appendChild(actions);
        card.appendChild(preView);
        card.appendChild(tableView);

        eventsContainer.appendChild(card);
    });
}
