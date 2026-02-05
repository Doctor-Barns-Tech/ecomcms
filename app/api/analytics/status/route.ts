import { NextResponse } from 'next/server';

export async function GET() {
  // Check if Google Analytics is configured
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaPropertyId = process.env.GA_PROPERTY_ID;
  const gaCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  const isBasicSetup = !!gaMeasurementId;
  const isFullSetup = isBasicSetup && !!gaPropertyId && !!gaCredentials;

  return NextResponse.json({
    connected: isFullSetup,
    basicTracking: isBasicSetup,
    measurementId: gaMeasurementId ? 'configured' : 'missing',
    propertyId: gaPropertyId ? 'configured' : 'missing',
    credentials: gaCredentials ? 'configured' : 'missing',
  });
}
