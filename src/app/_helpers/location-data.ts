import { IFormItemSearchData } from "../models/form-item-search-data";

export const locationsNested: IFormItemSearchData[] = [
  {id: 'bc', label: 'British Columbia', selectable: false, subitems: [
    {id: 'abbotsford', label: 'Abbotsford'},
    {id: 'burnaby', label: 'Burnaby'},
    {id: 'comox', label: 'Comox'},
    {id: 'coquitlam', label: 'Coquitlam'},
    {id: 'duncan', label: 'Duncan'},
    {id: 'kelowna', label: 'Kelowna'},
    {id: 'richmond', label: 'Richmond'},
    {id: 'surrey', label: 'Surrey'},
    {id: 'vancouver', label: 'Vancouver'},
    {id: 'victoria', label: 'Victoria'},
    {id: 'white_rock', label: 'White Rock'},
  ]},
  {id: 'on', label: 'Ontario', selectable: false, subitems: [
    {id: 'hamilton', label: 'Hamilton'},
    {id: 'kitchener', label: 'Ketchener'},
    {id: 'mississauga', label: 'Mississauga'},
    {id: 'ottawa', label: 'Ottawa'},
    {id: 'toronto', label: 'Toronto'},
    {id: 'vaughan', label: 'Vaughan'},
  ]},
  {id: 'mb', label: 'Manitoba', selectable: false, subitems: [
    {id: 'winnipeg', label: 'Winnipeg'},
  ]},
  {id: 'ab', label: 'Alberta', selectable: false, subitems: [
    {id: 'calgary', label: 'Calgary'},
    {id: 'edmonton', label: 'Edmonton'},
  ]}
];

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
  vancouver: new LocationData(49.282393,-123.120074, 12, 14),
  burnaby: new LocationData(49.247913,-122.982399, 10, 12),
  richmond: new LocationData( 49.165375,-123.133464, 9, 13),
  victoria: new LocationData(48.428116,-123.367138, 20, 12),
  kelowna: new LocationData(49.887919,-119.495905, 50, 13),
  coquitlam: new LocationData(49.283400,-122.786930, 15, 13),
  surrey: new LocationData(49.188800,-122.849414, 12, 12),
  white_rock: new LocationData(49.025178,-122.798603, 12, 13),
  abbotsford: new LocationData(49.049824,-122.296235, 15, 12),
  comox: new LocationData(49.673502,-124.928175, 100, 12),
  duncan: new LocationData(48.778602,-123.708088, 50, 11),

  toronto: new LocationData(43.652488,-79.382732, 20, 13),
  mississauga: new LocationData(43.587179,-79.650758, 24, 11),
  hamilton: new LocationData(43.255516,-79.870922, 32, 11),
  kitchener: new LocationData(43.452039,-80.496900, 41, 12),
  vaughan: new LocationData(43.856097,-79.511696, 20, 12),
  ottawa: new LocationData(45.418214,-75.700436, 50, 11),

  winnipeg: new LocationData(49.881810, -97.137068, 100, 10),

  edmonton: new LocationData(53.532962,-113.490293, 100, 12),
  calgary: new LocationData( 51.040915,-114.065465, 100, 11),
}

export function getLabelByCityId (id: CityId) {
  const list = id.split('_');

  for(var i=0; i<list.length; i++){
    list[i] = list[i].charAt(0).toUpperCase() + list[i].slice(1);
  }

  let label = list.join(' ');
  return label;
}

export type CityId = 
'abbotsford' | 
'burnaby' | 
'comox' |
'coquitlam' |
'duncan' |
'kelowna' |
'richmond' |
'surrey'| 
'vancouver' |
'victoria' |
'white_rock' |

'hamilton' |
'kitchener' |
'mississauga' |
'ottawa' |
'toronto' |
'vanghan' |

'winnipeg' |

'calgary' |
'edmonton';
