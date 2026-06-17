const state = {
    parsedData: [],
    eventsData: [],
    filtersSearchText: '',
    activeFilters: [],
    availableFilterKeys: []
};

// Exporting for potential module use, but keeping it accessible as a global if needed.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = state;
}
