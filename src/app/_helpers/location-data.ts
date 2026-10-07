import { IFormItemSearchData } from "../models/form-item-search-data";
import { slugify } from "./slugify";

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
    {id: 'kitchener', label: 'Kitchener'},
    {id: 'mississauga', label: 'Mississauga'},
    {id: 'north-york', label: 'North York'},
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
  'north-york': new LocationData(43.7615,-79.4111, 15, 13),
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
'north-york' |
'ottawa' |
'toronto' |
'vanghan' |

'winnipeg' |

'calgary' |
'edmonton';


export interface DirectoryCity {
  /** The id the directory routes on: /practitioners/area/<id>. */
  id: string;
  /** The bare city name, as the editor stores it on an article. */
  label: string;
  /** Two-letter province code, upper case. */
  province: string;
}

/* The directory city a piece of free text names, or null when it names none.
 *
 * Articles store location as typed, and live ones read "Richmond, BC",
 * "Richmond,  BC" and "Richmond, Dentist", so only the part before the first
 * comma is the city. Ids are not uniform either: most use hyphens, but
 * white_rock has an underscore, while "White Rock" slugifies to white-rock,
 * which no route knew. Both spellings are tried, so white_rock, white-rock
 * and "White Rock, BC" all find white_rock.
 *
 * The lookup is an own-property check because a bare index would find
 * "constructor" on every object. */
export function directoryCityOf(text: string): DirectoryCity | null {
  if (!text) { return null; }
  /* Underscores to spaces first: slugify deletes an underscore rather than
   * turning it into a hyphen, so white_rock itself would become whiterock. */
  const slug = slugify(String(text).split(',')[0].replace(/_/g, ' '));
  if (!slug) { return null; }
  const id = [slug, slug.replace(/-/g, '_')].find(k => Object.prototype.hasOwnProperty.call(locations, k));
  if (!id) { return null; }
  for (const province of locationsNested) {
    const city = (province.subitems || []).find(c => c.id == id);
    if (city) {
      return { id, label: city.label, province: String(province.id).toUpperCase() };
    }
  }
  return { id, label: getLabelByCityId(id as CityId), province: '' };
}
