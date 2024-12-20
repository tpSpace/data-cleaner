export interface Hotel {
  id: string;
  destination_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
  };
  description: string;
  amenities: {
    general: string[];
    room: string[];
  };
  images: {
    rooms: Image[];
    site: Image[];
    amenities: Image[];
  };
  booking_conditions: string[];
}

export interface Image {
  link: string;
  description: string;
}

export interface AcmeSupplier {
  Id: string;
  Name: string;
  Latitdue: number;
  DestinationId: string;
  Longitude: number;
  Address: string;
  City: string;
  Country: string;
  PostalCode: string;
  Description: string;
  Facilities: string[];
}

export interface PatagoniaSupplier {
  id: string;
  destination: string;
  name: string;
  lat: number;
  lng: number;
  info: string;
  amenities: string[];
  images: {
    rooms: patagoniaImage[];
    amenities: patagoniaImage[];
  };
}

export interface patagoniaImage {
  url: string;
  description: string;
}

export interface PaperfliesSupplier {
  hotel_id: string;
  destination_id: string;
  hotel_name: string;
  location: {
    address: string;
    country: string;
  };
  details: string;
  amenities: {
    general: string[];
    room: string[];
  };
  images: {
    rooms: paperfliesImage[];
    site: paperfliesImage[];
  };
  booking_conditions: string[];
}

export interface paperfliesImage {
  link: string;
  caption: string;
}
