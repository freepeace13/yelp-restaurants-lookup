import { Address } from "../valueobjects/Address.js";
import { Coordinate } from "../valueobjects/Coordinates.js";
import { Rating } from "../valueobjects/Rating.js";

function fromYelpBusiness(business) {
    const loc = business.location ?? {};
    const street = [loc.address1, loc.address2, loc.address3]
        .filter(Boolean)
        .join(', ');
    const displayLines = Array.isArray(loc.display_address)
        ? loc.display_address.filter((s) => Boolean(s && String(s).trim()))
        : undefined;
    return {
        alias: business.alias,
        name: business.name,
        rating: business.rating,
        address: {
            street,
            city: loc.city,
            state: loc.state,
            zip: loc.zip_code,
            country: loc.country,
            displayLines,
        },
        coordinates: {
            latitude: business.coordinates?.latitude,
            longitude: business.coordinates?.longitude,
        },
    };
}

export class Restaurant {
    /**
     * @param {object} business - raw Yelp business
     * @param {object} [options]
     * @param {import("../utils/geoDistance.js").LocationRelevance | undefined} [options.locationRelevance]
     */
    constructor(business, options = {}) {
        const { alias, name, rating, address, coordinates } =
            fromYelpBusiness(business);
        this.alias = alias;
        this.name = name;
        this.rating = new Rating(rating);
        this.address = new Address(address);
        this.coordinates = new Coordinate(coordinates);
        this.locationRelevance = options.locationRelevance ?? {
            assessed: false,
            distanceMiles: null,
            withinSearchRadius: null,
        };
    }

    toJSON() {
        return {
            alias: this.alias,
            name: this.name,
            rating: this.rating.toJSON(),
            address: this.address.toJSON(),
            coordinates: this.coordinates.toJSON(),
            locationRelevance: this.locationRelevance,
        };
    }
}
