import { ProviderKey, TravelMode, TravelStrategy } from '@/types/travel';

export const TRAVEL_MODES: Array<{ value: TravelMode; label: string; helper: string }> = [
  {
    value: 'save_money',
    label: 'Save money',
    helper: 'Prioritize lower total cost and practical trade-offs.',
  },
  {
    value: 'comfort',
    label: 'Comfort',
    helper: 'Prioritize shorter travel time and smoother experiences.',
  },
];

export const MODE_STRATEGIES: Record<TravelMode, TravelStrategy[]> = {
  save_money: ['budget-first', 'balanced', 'comfort-first'],
  comfort: ['comfort-first', 'balanced', 'budget-first'],
};

export const AFFILIATE_PROVIDERS: Record<
  ProviderKey,
  {
    name: string;
    defaultReason: string;
    ctaLabel: string;
    baseUrl: string;
    affParam?: string;
    envVar?: string;
  }
> = {
  skyscanner: {
    name: 'Skyscanner',
    defaultReason: 'Good for comparing multiple flight combinations quickly.',
    ctaLabel: 'Compare flights',
    baseUrl: 'https://www.skyscanner.com/transport/flights',
    affParam: 'associateid',
    envVar: 'TRAVEL_AFFILIATE_SKYSCANNER_ID',
  },
  omio: {
    name: 'Omio',
    defaultReason: 'Convenient for train and bus route combinations in Europe.',
    ctaLabel: 'Check trains & buses',
    baseUrl: 'https://www.omio.com/',
    affParam: 'partnerId',
    envVar: 'TRAVEL_AFFILIATE_OMIO_ID',
  },
  db: {
    name: 'Deutsche Bahn (DB)',
    defaultReason: 'Best first stop for train travel in Germany.',
    ctaLabel: 'Search on DB',
    baseUrl: 'https://int.bahn.de/en',
  },
  obb: {
    name: 'OBB',
    defaultReason: 'Official Austrian rail app/site for Vienna and Austria routes.',
    ctaLabel: 'Search on OBB',
    baseUrl: 'https://www.oebb.at/en/',
  },
  sncf: {
    name: 'SNCF Connect',
    defaultReason: 'Official rail platform for France domestic and intercity trains.',
    ctaLabel: 'Search on SNCF',
    baseUrl: 'https://www.sncf-connect.com/en-en/',
  },
  mav: {
    name: 'MAV',
    defaultReason: 'Official Hungarian rail booking platform.',
    ctaLabel: 'Search on MAV',
    baseUrl: 'https://jegy.mav.hu/?lang=en',
  },
  flixbus: {
    name: 'FlixBus',
    defaultReason: 'Strong low-cost bus coverage across Europe.',
    ctaLabel: 'Search on FlixBus',
    baseUrl: 'https://global.flixbus.com/',
  },
  blablacar: {
    name: 'BlaBlaCar',
    defaultReason: 'Useful for ridesharing and budget intercity options.',
    ctaLabel: 'Search on BlaBlaCar',
    baseUrl: 'https://www.blablacar.com/',
  },
  trainline: {
    name: 'Trainline',
    defaultReason: 'Convenient cross-border rail comparison and booking.',
    ctaLabel: 'Search on Trainline',
    baseUrl: 'https://www.thetrainline.com/',
  },
  booking: {
    name: 'Booking.com',
    defaultReason: 'Broad hotel inventory with flexible cancellation options.',
    ctaLabel: 'Find stays',
    baseUrl: 'https://www.booking.com/searchresults.html',
    affParam: 'aid',
    envVar: 'TRAVEL_AFFILIATE_BOOKING_ID',
  },
  hostelworld: {
    name: 'Hostelworld',
    defaultReason: 'Strong budget and social stay options for students.',
    ctaLabel: 'Find hostels',
    baseUrl: 'https://www.hostelworld.com/st/hostels/europe',
    affParam: 'affiliate',
    envVar: 'TRAVEL_AFFILIATE_HOSTELWORLD_ID',
  },
};

export const CITY_TO_COUNTRY: Record<string, 'de' | 'at' | 'fr' | 'hu' | 'other'> = {
  berlin: 'de',
  munich: 'de',
  hamburg: 'de',
  vienna: 'at',
  paris: 'fr',
  budapest: 'hu',
};

export const KNOWN_CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  paris: { lat: 48.8566, lon: 2.3522 },
  berlin: { lat: 52.52, lon: 13.405 },
  vienna: { lat: 48.2082, lon: 16.3738 },
  budapest: { lat: 47.4979, lon: 19.0402 },
  prague: { lat: 50.0755, lon: 14.4378 },
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  madrid: { lat: 40.4168, lon: -3.7038 },
  barcelona: { lat: 41.3874, lon: 2.1686 },
  rome: { lat: 41.9028, lon: 12.4964 },
  milan: { lat: 45.4642, lon: 9.19 },
  lisbon: { lat: 38.7223, lon: -9.1393 },
  brussels: { lat: 50.8503, lon: 4.3517 },
  warsaw: { lat: 52.2297, lon: 21.0122 },
  munich: { lat: 48.1351, lon: 11.582 },
  hamburg: { lat: 53.5511, lon: 9.9937 },
  copenhagen: { lat: 55.6761, lon: 12.5683 },
  stockholm: { lat: 59.3293, lon: 18.0686 },
  dublin: { lat: 53.3498, lon: -6.2603 },
  athens: { lat: 37.9838, lon: 23.7275 },
  zurich: { lat: 47.3769, lon: 8.5417 },
};

export const DEFAULT_ASSUMPTIONS = [
  'Costs are estimated and may vary by season and booking timing.',
  'Accommodation is estimated for one traveler in Europe.',
  'Transport estimates assume standard economy options.',
];
