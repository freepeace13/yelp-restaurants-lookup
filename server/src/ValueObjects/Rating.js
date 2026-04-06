export class Rating {
    constructor(value) {
        const n = value == null ? null : Number(value);
        this.value = n != null && !Number.isNaN(n) ? n : null;
    }

    toJSON() {
        if (this.value == null) {
            return {
                value: null,
                formats: { display: '—' },
            };
        }
        return {
            value: this.value,
            formats: {
                display: `${this.value} ★`,
            },
        };
    }
}
