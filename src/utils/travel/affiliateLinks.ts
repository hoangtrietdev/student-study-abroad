import { AFFILIATE_PROVIDERS } from '@/constants/travel';
import { ProviderKey } from '@/types/travel';

export interface AffiliateLinkParams {
  provider: ProviderKey;
  originCity: string;
  destinationCity: string;
  startDate?: string;
  endDate?: string;
  requestId: string;
  planId: string;
}

function isAffiliateEnabled(): boolean {
  const value = (process.env.IS_ENABLE_AFFILIATE || '').trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes';
}

export function buildExternalAffiliateUrl(params: AffiliateLinkParams): string {
  const provider = AFFILIATE_PROVIDERS[params.provider];
  const url = new URL(provider.baseUrl);

  if (isAffiliateEnabled()) {
    const affiliateId = provider.envVar ? process.env[provider.envVar] || '' : '';
    if (affiliateId && provider.affParam) {
      url.searchParams.set(provider.affParam, affiliateId);
      url.searchParams.set('utm_source', process.env.TRAVEL_AFFILIATE_DEFAULT_UTM_SOURCE || 'studyoverseasmap');
      url.searchParams.set('utm_medium', 'affiliate');
      url.searchParams.set('utm_campaign', 'travel_planner');
      url.searchParams.set('subid', `${params.requestId}-${params.planId}`);
    }
  }

  if (params.provider === 'skyscanner') {
    url.pathname = `${url.pathname}/${encodeURIComponent(params.originCity)}/${encodeURIComponent(params.destinationCity)}`;
    if (params.startDate) url.searchParams.set('outDate', params.startDate);
    if (params.endDate) url.searchParams.set('inDate', params.endDate);
  } else if (params.provider === 'omio') {
    url.pathname = '/';
    url.searchParams.set('locale', 'en');
  } else if (params.provider === 'db') {
    url.searchParams.set('dbkanal_007', 'teaserLink');
  } else if (params.provider === 'obb') {
    url.searchParams.set('from', params.originCity);
    url.searchParams.set('to', params.destinationCity);
    if (params.startDate) url.searchParams.set('date', params.startDate);
  } else if (params.provider === 'sncf') {
    url.searchParams.set('origin', params.originCity);
    url.searchParams.set('destination', params.destinationCity);
    if (params.startDate) url.searchParams.set('date', params.startDate);
  } else if (params.provider === 'mav') {
    url.searchParams.set('from', params.originCity);
    url.searchParams.set('to', params.destinationCity);
    if (params.startDate) url.searchParams.set('date', params.startDate);
  } else if (params.provider === 'flixbus') {
    url.searchParams.set('from', params.originCity);
    url.searchParams.set('to', params.destinationCity);
    if (params.startDate) url.searchParams.set('departureDate', params.startDate);
  } else if (params.provider === 'blablacar') {
    url.searchParams.set('from', params.originCity);
    url.searchParams.set('to', params.destinationCity);
    if (params.startDate) url.searchParams.set('date', params.startDate);
  } else if (params.provider === 'trainline') {
    url.pathname = '/';
    url.searchParams.set('from', params.originCity);
    url.searchParams.set('to', params.destinationCity);
    if (params.startDate) url.searchParams.set('date', params.startDate);
  } else if (params.provider === 'booking') {
    url.searchParams.set('ss', params.destinationCity);
    if (params.startDate) url.searchParams.set('checkin', params.startDate);
    if (params.endDate) url.searchParams.set('checkout', params.endDate);
  } else if (params.provider === 'hostelworld') {
    url.pathname = `${url.pathname}/${encodeURIComponent(params.destinationCity)}`;
    if (params.startDate) url.searchParams.set('dateFrom', params.startDate);
    if (params.endDate) url.searchParams.set('dateTo', params.endDate);
  }

  return url.toString();
}

export function buildInternalRedirectUrl(params: AffiliateLinkParams): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  const path = new URL(base ? '/api/travel/redirect' : 'http://localhost/api/travel/redirect', base || 'http://localhost');

  path.searchParams.set('provider', params.provider);
  path.searchParams.set('requestId', params.requestId);
  path.searchParams.set('planId', params.planId);
  path.searchParams.set('from', params.originCity);
  path.searchParams.set('to', params.destinationCity);
  if (params.startDate) path.searchParams.set('start', params.startDate);
  if (params.endDate) path.searchParams.set('end', params.endDate);

  if (base) return path.toString();
  return `${path.pathname}${path.search}`;
}
