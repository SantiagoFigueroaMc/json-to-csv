function parseEvents(data) {
    return data
        .filter(ev =>
            !!ev.payload?.ACPExtensionEventData?.xdm
        )
        .map(ev => ({
            ...ev.payload.ACPExtensionEventData.xdm,
            timestampMs: ev.timestamp,
        }));
}