import { NextResponse } from 'next/server';

// Google Analytics Data API v1
// Reference: https://developers.google.com/analytics/devguides/reporting/data/v1

interface GACredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

async function getAccessToken(credentials: GACredentials): Promise<string> {
  const jwt = await createJWT(credentials);
  
  const response = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function createJWT(credentials: GACredentials): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: credentials.token_uri,
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signInput = `${headerB64}.${payloadB64}`;
  
  // Import private key and sign
  const privateKey = credentials.private_key;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${signInput}.${signatureB64}`;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7days';

    const propertyId = process.env.GA_PROPERTY_ID;
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!propertyId || !credentialsJson) {
      return NextResponse.json({
        success: false,
        error: 'Google Analytics not configured',
        setup: {
          propertyId: propertyId ? 'set' : 'missing',
          credentials: credentialsJson ? 'set' : 'missing',
        }
      });
    }

    let credentials: GACredentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials JSON',
      });
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        // Keep same day
        break;
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Get access token
    const accessToken = await getAccessToken(credentials);

    // Fetch main metrics
    const metricsResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          metrics: [
            { name: 'screenPageViews' },
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
        }),
      }
    );

    const metricsData = await metricsResponse.json();

    // Fetch daily visits
    const dailyResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'date' }],
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
          ],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),
      }
    );

    const dailyData = await dailyResponse.json();

    // Fetch devices
    const devicesResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'sessions' }],
        }),
      }
    );

    const devicesData = await devicesResponse.json();

    // Fetch top pages
    const pagesResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 10,
        }),
      }
    );

    const pagesData = await pagesResponse.json();

    // Fetch locations
    const locationsResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: formatDate(startDate), endDate: formatDate(endDate) }],
          dimensions: [{ name: 'country' }, { name: 'city' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 10,
        }),
      }
    );

    const locationsData = await locationsResponse.json();

    // Parse responses
    const mainMetrics = metricsData.rows?.[0]?.metricValues || [];
    const totalSessions = parseInt(mainMetrics[1]?.value || '0');

    // Format session duration
    const avgDurationSeconds = parseFloat(mainMetrics[4]?.value || '0');
    const minutes = Math.floor(avgDurationSeconds / 60);
    const seconds = Math.floor(avgDurationSeconds % 60);
    const avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Parse devices with percentages
    const topDevices = (devicesData.rows || []).map((row: any) => {
      const sessions = parseInt(row.metricValues[0].value);
      return {
        device: row.dimensionValues[0].value,
        sessions,
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
      };
    });

    // Parse daily visits
    const dailyVisits = (dailyData.rows || []).map((row: any) => {
      const dateStr = row.dimensionValues[0].value;
      const formattedDate = `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
      return {
        date: formattedDate,
        visits: parseInt(row.metricValues[0].value),
        pageViews: parseInt(row.metricValues[1].value),
      };
    });

    // Parse top pages
    const topPages = (pagesData.rows || []).map((row: any) => ({
      page: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
    }));

    // Parse locations
    const topLocations = (locationsData.rows || []).map((row: any) => ({
      country: row.dimensionValues[0].value,
      city: row.dimensionValues[1].value || 'Unknown',
      sessions: parseInt(row.metricValues[0].value),
    }));

    return NextResponse.json({
      success: true,
      data: {
        pageViews: parseInt(mainMetrics[0]?.value || '0'),
        sessions: totalSessions,
        users: parseInt(mainMetrics[2]?.value || '0'),
        bounceRate: parseFloat(mainMetrics[3]?.value || '0') * 100,
        avgSessionDuration,
        dailyVisits,
        topDevices,
        topPages,
        topLocations,
      },
    });

  } catch (error: any) {
    console.error('Error fetching GA data:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch analytics data',
    });
  }
}
