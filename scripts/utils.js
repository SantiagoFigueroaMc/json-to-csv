class Observable {
    _value;
    _listeners = [];
    set(val) {
        this._value = val;
        this._listeners.forEach(
            listener => listener(val)
        );
    }
    get() {
        return this._value;
    }
    subscribe(listener) {
        this._listeners.push(listener);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
    } catch (err) {
        console.error(err);
        alert('Failed to copy');
    }
}

function createTSV(event) {
    const rows = Object.entries(event).map(([key, value]) => {

        let formattedValue = value;

        if (typeof value === 'object' && value !== null) {
            formattedValue = JSON.stringify(value);
        }

        return `${key}\t${formattedValue}`;
    });

    return rows.join('\n');
}

function createDashBoardCard(key, count) {
    const card =
        document.createElement('div');
    card.className = 'event-card';
    card.style.minWidth = '180px';
    card.innerHTML = `
        <h3 style="margin:0 0 8px 0;">
            ${key}
        </h3>
        <p style="
            font-size: 28px;
            margin: 0;
            font-weight: bold;
            color: #1976d2;
        ">
            ${count}
        </p>
        <p class="info">
            occurrences
        </p>
    `;
    return card;
}

function createTable(event) {

    const table = document.createElement('table');

    table.innerHTML = `
            <thead>
                <tr>
                    <th>Key</em>
                    <th>Value</em>
                </tr>
            </thead>
        `;

    const tbody = document.createElement('tbody');

    Object.entries(event).forEach(([key, value]) => {

        const row = document.createElement('tr');

        let formattedValue = value;

        if (typeof value === 'object' && value !== null) {
            formattedValue = JSON.stringify(value);
        }

        row.innerHTML = `
                <td>${key}</td>
                <td>${formattedValue}</td>
            `;

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    return table;
}

/**
 * @param {name:string,data:Object} file The file
 * @returns {string} Text with the file size with one decimal and the letters
 */
function humanReadableFileSize(file) {
    if (!file || !file.data) {
        return "0 B";
    }

    let bytes = new Blob([JSON.stringify(file.data)]).size;

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;

    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }

    return `${unitIndex === 0 ? bytes : bytes.toFixed(1)} ${units[unitIndex]}`;
}
