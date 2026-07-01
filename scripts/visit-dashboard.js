function getDataContainer() {
    return visitDashboardContainer.querySelector(".data")
}
function getErrorContainer() {
    return visitDashboardContainer.querySelector(".error")
}
function getLoadingContainer() {
    return visitDashboardContainer.querySelector(".loading")
}
function getEmptyContainer() {
    return visitDashboardContainer.querySelector(".empty")
}

function renderVisitDashboard() {
    setStatus("loading");

    const filteredEvents = getFilteredEvents();

    if (!filteredEvents) {
        setStatus("empty");
        return;
    }

    try {
        const visit = {};
        const visitsContainer = getDataContainer();
        visitsContainer.innerHTML = '';
        filteredEvents.forEach(element => {
            Object.keys(element).forEach(key => {
                if (!visit[key]) visit[key] = [];
                if (visit[key].includes(element[key])) return;
                visit[key].push(element[key]);
            })
        });
        Object.keys(visit).sort((a, b) => a > b).forEach(key => {
            visitsContainer.innerHTML += `<span>${key}: ${JSON.stringify(visit[key])}</span>`
        })
        setStatus("content");
    } catch {
        setStatus("error")
    }
}

function setStatus(status) {
    visitDashboardContainer.querySelector(".data").classList.toggle("hidden", status != "content");
    visitDashboardContainer.querySelector(".error").classList.toggle("hidden", status != "error");
    visitDashboardContainer.querySelector(".empty").classList.toggle("hidden", status != "no-data");
    visitDashboardContainer.querySelector(".loading").classList.toggle("hidden", status != "loading");
}

