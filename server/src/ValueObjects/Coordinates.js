export class Coordinate {
    constructor({
        latitude,
        longitude
    }) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    formatDisplay() {
        const lat = this.latitude;
        const lon = this.longitude;
        const has =
            lat != null &&
            lon != null &&
            !Number.isNaN(Number(lat)) &&
            !Number.isNaN(Number(lon));
        if (!has) {
            return '—';
        }
        return `${Number(lat).toFixed(5)}, ${Number(lon).toFixed(5)}`;
    }

    toJSON() {
        const lat = this.latitude;
        const lon = this.longitude;
        return {
            latitude: lat ?? null,
            longitude: lon ?? null,
            formats: {
                display: this.formatDisplay(),
            },
        };
    }
}