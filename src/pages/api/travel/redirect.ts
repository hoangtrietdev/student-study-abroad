import type { NextApiRequest, NextApiResponse } from 'next';
import { ProviderKey } from '@/types/travel';
import { buildExternalAffiliateUrl } from '@/utils/travel/affiliateLinks';

function isProvider(value: string): value is ProviderKey {
  return (
    value === 'skyscanner' ||
    value === 'omio' ||
    value === 'booking' ||
    value === 'hostelworld' ||
    value === 'db' ||
    value === 'obb' ||
    value === 'sncf' ||
    value === 'mav' ||
    value === 'flixbus' ||
    value === 'blablacar' ||
    value === 'trainline'
  );
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const providerRaw = String(req.query.provider || '');
  if (!isProvider(providerRaw)) {
    return res.status(400).json({ message: 'Invalid provider' });
  }

  const requestId = String(req.query.requestId || '');
  const planId = String(req.query.planId || '');
  const originCity = String(req.query.from || '');
  const destinationCity = String(req.query.to || '');
  const startDate = req.query.start ? String(req.query.start) : undefined;
  const endDate = req.query.end ? String(req.query.end) : undefined;

  if (!requestId || !planId || !originCity || !destinationCity) {
    return res.status(400).json({ message: 'Missing required query params.' });
  }

  const target = buildExternalAffiliateUrl({
    provider: providerRaw,
    requestId,
    planId,
    originCity,
    destinationCity,
    startDate,
    endDate,
  });

  console.log('[affiliate_click]', {
    provider: providerRaw,
    requestId,
    planId,
    originCity,
    destinationCity,
    startDate,
    endDate,
    timestamp: new Date().toISOString(),
  });

  return res.redirect(302, target);
}
