
// Helper to make timestamps readable
const formatTimestamp = (ms) => new Date(ms).toLocaleString();

function renderTimeline() {
    // 1. Clear the current content of the timeline container
    timelineContainer.innerHTML = '';
    
    
    // 2. Get the filtered events
    const filteredEvents = getFilteredEvents();
    
    // 3. Iterate and create cards
    filteredEvents.forEach(event => {
        const card = createTimelineCard(event);
        timelineContainer.appendChild(card);
    });

    // 4. Add a counter to the timeline title
    timelineContainer.closest("details").querySelector("summary").innerText = `Timeline (${filteredEvents.length} events found)`;
}

function createTimelineCard(event) {
    // Create the main container
    const card = document.createElement('div');
    card.className = 'timeline-item'; // Use a specific class for timeline styling

    // 1. Information Section (Time & Name)
    const info = document.createElement('div');
    info.className = 'timeline-card';

    // Extra info 
    const filterKeys = activeFilters.map(f => {
            if (!event[f]) return;
            return `<span class="timeline-title">${f}: ${event[f]}<span>`;
        }).filter(t => !!t).join("");

    // Format: [Date] Type: Name
    const dateStr = formatTimestamp(event.timestampMs);
    info.innerHTML = `
        <span class="timeline-time">${dateStr}</span>
        <span class="timeline-title">eventType: ${event.eventType}</span>
        <span class="timeline-title">eventName: ${event.eventName}</span>
        ${filterKeys}
    `;
    card.appendChild(info);

    // 2. Actions Section (Dropdown + Dialog Button)
    const actions = document.createElement('div');
    actions.className = 'timeline-actions';

    const newDropdown = createDropdown({label:"Copy",items:[
        {
            label: "as JSON", 
            callback: ()=>{
                copyToClipboard(JSON.stringify(event, null, 2));
            },
        },
        {
            label: "as Table",
            callback: ()=>{
                copyToClipboard(createTSV(event))
            }
        }
    ]});

    // The Detail Button
    const detailBtn = document.createElement('button');
    detailBtn.textContent = 'Details';
    detailBtn.className = 'detail-btn';
    detailBtn.onclick = () => {
        // This calls a function that opens your modal/dialog UI
        openDetailDialog(event);
    };

    actions.appendChild(newDropdown);
    actions.appendChild(detailBtn);
    card.appendChild(actions);

    return card;
}
