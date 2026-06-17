
/**
 * This function builds the content for the Dialog/Modal.
 * Depending on your UI framework, you might call this when a modal opens.
 */
function createEventDialog(event) {
    // Create a container that will be injected into your Modal HTML
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';

    // 1. Header (Name + Toggle Switch)
    const header = document.createElement('div');
    header.innerHTML = `<h2>${event.eventName}</h2>`;

    // You can use your existing viewSwitch or a local one for the modal
    const toggle = document.createElement('div');
    toggle.className = 'view-switch-container';
    toggle.innerHTML = `<label>View: </label>`;
    // Add actual checkbox/toggle logic here if needed

    dialogContent.appendChild(header);

    // 2. The View Toggle Logic (Pre vs Table)
    const preView = document.createElement('div');
    preView.className = viewSwitch.checked ? 'hidden' : '';
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(event, null, 2);
    preView.appendChild(pre);

    const tableView = document.createElement('div');
    tableView.className = viewSwitch.checked ? '' : 'hidden';
    tableView.innerHTML = '';
    tableView.appendChild(createTable(event)); // Assuming this returns a DOM element

    dialogContent.appendChild(preView);
    dialogContent.appendChild(tableView);

    const dialogActions = document.createElement('div');
    dialogActions.classList.add("dialog-actions");
    const newDropdown = createDropdown({label:"Copy", items:[
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
    dialogActions.appendChild(newDropdown);

    dialogContent.appendChild(dialogActions);

    return dialogContent;
}
// --- NEW HELPER FUNCTIONS FOR THE MODAL ---

const modal = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close-button');

// This function is called when you click "Details" in the timeline card
function openDetailDialog(event) {
    // 1. Generate the HTML content using your existing logic
    const content = createEventDialog(event);
    
    // 2. Inject it into the modal body
    modalBody.innerHTML = ''; // Clear old content
    modalBody.appendChild(content);
    
    // 3. Show the modal
    modal.classList.add('active');

    // 4. Prevent scrolling on document body
    document.body.classList.add('no-scroll');
}

// Function to close the modal (reusable for multiple ways of closing)
function closeModal() {
    modal.classList.remove('active');
    
    // ADD THIS LINE: Remove the class from body
    document.body.classList.remove('no-scroll');
}

// Update your click listeners to use the new closeModal function
closeBtn.onclick = closeModal;

window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};