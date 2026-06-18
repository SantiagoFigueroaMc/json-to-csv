// Query Selectors - Ensure your HTML filter input has an id/class to prevent collisions
var file_input = document.querySelector("aside input#upload-file");
var file_explorer = document.querySelector("aside ul.file-explorer");
var filter_input = document.querySelector("aside input#filter-file") || document.querySelector("aside input:not(#upload-file)"); 
var files = [];
var filter_value = "";

var get_filtered_files = () => {
    if (!filter_value.trim()) return files;
    return files.filter(file => 
        file.name.toLowerCase().includes(filter_value.toLowerCase())
    );
}

function renderFiles() {
    file_explorer.innerHTML = "";
    const filteredFiles = get_filtered_files();

    if (filteredFiles.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-message";
        emptyItem.textContent = "No files found";
        file_explorer.appendChild(emptyItem);
        return;
    }

    filteredFiles.forEach(file => {
        const li = document.createElement("li");
        li.className = "file-item";
        // Store filename data securely on the element
        li.dataset.filename = file.name; 

        // File name text container
        const nameSpan = document.createElement("span");
        nameSpan.className = "file-name";
        nameSpan.textContent = `${file.name}`;
        nameSpan.title = file.name;
        nameSpan.addEventListener("click", onFileClick);
        li.appendChild(nameSpan);

        const fileSizeSpan = document.createElement("span");
        fileSizeSpan.className = "file-size";
        fileSizeSpan.textContent = `(${humanReadableFileSize(file)})`;
        li.appendChild(fileSizeSpan);

        // Delete action item button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-file-btn";
        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Borrar";
        deleteBtn.addEventListener("click", onDeleteFileClick);
        li.appendChild(deleteBtn);

        file_explorer.appendChild(li);
    });
}

// Helper to guarantee the bucket is open before running tasks
async function getBucket() {
  if (!('storageBuckets' in navigator)) {
    throw new Error('Storage Buckets API is not supported in this browser.');
  }
  return await navigator.storageBuckets.open('json-file-bucket');
}

// Helper to open the specific cache storage container inside the bucket
async function getFileCache() {
  const bucket = await getBucket();
  return await bucket.caches.open('json-files');
}

/**
 * Retrieves all saved JSON files from the storage bucket.
 */
async function getFilesFromStorage() {
  try {
    const cache = await getFileCache();
    const requests = await cache.keys();
    
    const filePromises = requests.map(async (request) => {
      const response = await cache.match(request);
      const data = await response.json();
      
      const url = new URL(request.url);
      
      // FIX: Add decodeURIComponent to convert %20 back to spaces, etc.
      const name = decodeURIComponent(url.pathname.replace(/^\//, '')); 
      
      return { name, data };
    });

    files = await Promise.all(filePromises);
    renderFiles(); 
    return files;
  } catch (error) {
    console.error('Failed to retrieve files:', error);
    return [];
  }
}


/**
 * Saves a JSON file to the storage bucket.
 */
async function saveFileToStorage(file) {
  try {
    const cache = await getFileCache();
    
    const jsonResponse = new Response(JSON.stringify(file.data), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(`/${file.name}`, jsonResponse);
    console.log(`File "${file.name}" saved successfully.`);
    await getFilesFromStorage(); // Refresh master arrays
  } catch (error) {
    console.error(`Failed to save file "${file.name}":`, error);
  }
}

/**
 * Deletes a specific file from the storage bucket.
 */
async function deleteFile(file) {
  try {
    const cache = await getFileCache();
    const fileName = typeof file === 'string' ? file : file.name;
    
    // FIX: Encode the filename here so the Cache API can find the path correctly
    const encodedPath = `/${encodeURIComponent(fileName)}`;
    
    const deleted = await cache.delete(encodedPath);
    if (deleted) {
      console.log(`File "${fileName}" deleted successfully.`);
      await getFilesFromStorage(); 
    } else {
      console.warn(`File "${fileName}" not found in storage.`);
    }
  } catch (error) {
    console.error(`Failed to delete file:`, error);
  }
}


function loadFileToMainWindow(file) {
    document.title = '📋 ' + file.name;

    // FIX: If the argument is an app-state storage file record, bypass FileReader completely
    if (!(file instanceof File) && file.data) {
        processJsonPayload(file.data);
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const rawJson = JSON.parse(event.target.result);
            processJsonPayload(rawJson);
        } catch (error) {
            console.error(error);
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

function processJsonPayload(rawJson) {
    let rawData = rawJson;
    if (!Array.isArray(rawData)) {
        rawData = rawJson.events;
    }

    if (!Array.isArray(rawData)) {
        alert('Invalid format. JSON must be an array or contain an "events" array');
        return;
    }

    parsedData = parseEvents(rawData);
    
    const parseStatus = document.getElementById("parseStatus") || document.createElement("div");
    parseStatus.innerHTML = `
        <span class="success">
            Parsed ${parsedData.length} events successfully
        </span>
    `;
    
    eventsData = parsedData;
    buildFilters(eventsData);
    renderTimeline();
}

function onFileClick(event) {
    const filename = event.target.closest('li').dataset.filename;
    const fileTarget = files.find(f => f.name === filename);
    if (fileTarget) {
        loadFileToMainWindow(fileTarget);
    }
}

async function onDeleteFileClick(event) {
    // COMPLETED: Detect file context via dataset property and delete
    const filename = event.target.closest('li').dataset.filename;
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
        await deleteFile(filename);
    }
}

function onFileUploadInputChange(event) {
    // COMPLETED: Process input browser upload, read payload, save to bucket, clean UI context
    const nativeFile = event.target.files[0];
    if (!nativeFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const dataPayload = JSON.parse(e.target.result);
            
            await saveFileToStorage({
                name: nativeFile.name,
                data: dataPayload
            });

            // Automatically load it into view after a clean save
            const savedFileInstance = files.find(f => f.name === nativeFile.name);
            if (savedFileInstance) {
                loadFileToMainWindow(savedFileInstance);
            }
        } catch (err) {
            alert('Uploaded file is not a valid JSON string structure.');
            console.error(err);
        }
        // Reset input element value to allow identical filename re-uploads
        file_input.value = "";
    };
    reader.readAsText(nativeFile);
}

function onFilterInputChange(event) {
    filter_value = event.target.value;
    renderFiles();
}

// Core setup integration pipeline
window.addEventListener("DOMContentLoaded", () => {
    // Attach listener infrastructure
    if (file_input) file_input.addEventListener("change", onFileUploadInputChange);
    if (filter_input) filter_input.addEventListener("input", onFilterInputChange);
    
    // Call bucket storage fetch query system directly
    getFilesFromStorage();
});
