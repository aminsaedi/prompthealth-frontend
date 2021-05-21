class LocationData {
  lat: number;
  lng: number;
  distance: number; /** km */
  zoom: number;

  constructor(lat: number, lng: number, distance: number, zoom: number) {
    this.lat = lat;
    this.lng = lng;
    this.distance = distance;
    this.zoom = zoom;
  }
}

export const locations: {[k:string]: LocationData} = {
  vancouver: new LocationData(49.278794,-123.128201, 12, 14),
  burnaby: new LocationData(49.247913,-122.982399, 10, 12),
  richmond: new LocationData( 49.165375,-123.133464, 9, 13),
  victoria: new LocationData(48.428116,-123.367138, 20, 12),
  kelowna: new LocationData(49.887919,-119.495905, 50, 13),
  coquitlam: new LocationData(49.283400,-122.786930, 15, 13),
  surrey: new LocationData(49.188800,-122.849414, 12, 12),
  white_rock: new LocationData(49.025178,-122.798603, 12, 13),
  abbotsford: new LocationData(49.049824,-122.296235, 15, 13),
  comox: new LocationData(49.673502,-124.928175, 100, 12),
  duncan: new LocationData(48.778602,-123.708088, 50, 11),

  toronto: new LocationData(43.652488,-79.382732, 20, 14),
  mississauga: new LocationData(43.587179,-79.650758, 24, 12),
  hamilton: new LocationData(43.255516,-79.870922, 32, 11 ),
  kitchener: new LocationData(43.452039,-80.496900, 41, 12),
  vaughan: new LocationData(43.856097,-79.511696, 20, 12),
  ottawa: new LocationData(45.418214,-75.700436, 50, 11),

  winnipeg: new LocationData(49.881810, -97.137068, 100, 10),

  edmonton: new LocationData(53.532962,-113.490293, 100, 12),
  calgary: new LocationData( 51.040915,-114.065465, 100, 11),
}

