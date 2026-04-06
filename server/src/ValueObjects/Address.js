export class Address {
    constructor({
        street,
        city,
        state,
        zip,
        country,
        /** @type {string[] | undefined} Yelp `location.display_address` when present */
        displayLines,
    }) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.country = country;
        this.displayLines = displayLines;
    }

    formatDisplay() {
        if (this.displayLines?.length) {
            return this.displayLines.join(' · ');
        }
        const line1 = [this.street, this.city].filter(Boolean).join(', ');
        const line2 = [this.state, this.zip].filter(Boolean).join(' ');
        return [line1, line2].filter(Boolean).join(' · ') || '—';
    }

    toJSON() {
        return {
            street: this.street,
            city: this.city,
            state: this.state,
            zip: this.zip,
            country: this.country,
            formats: {
                display: this.formatDisplay(),
            },
        };
    }
}