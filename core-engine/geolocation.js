/**
 * Wotmed-Net IP Geolocation Service
 * Provider: ipinfo.io
 * 
 * Features:
 * - Validates public IP addresses before geolocation
 * - Caches geolocation results to reduce API calls
 * - Respects rate limits and handles errors gracefully
 * - Only geolocates globally routable public IPs
 */

const https = require('https');

// Cache with TTL (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const geolocationCache = new Map();

/**
 * Check if an IP address is globally routable (public)
 * Excludes: loopback, private, link-local, reserved, multicast, unspecified
 */
function isPublicIp(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }

  // Normalize IPv4-mapped IPv6
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4 validation
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv4Match = ip.match(ipv4Regex);
  
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    
    // Check each octet is valid (0-255)
    if (octets.some(o => o > 255)) {
      return false;
    }

    const [a, b, c, d] = octets;

    // Loopback: 127.0.0.0/8
    if (a === 127) {
      return false;
    }

    // Private: 10.0.0.0/8
    if (a === 10) {
      return false;
    }

    // Private: 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) {
      return false;
    }

    // Private: 192.168.0.0/16
    if (a === 192 && b === 168) {
      return false;
    }

    // Link-local: 169.254.0.0/16
    if (a === 169 && b === 254) {
      return false;
    }

    // Reserved for benchmark: 198.18.0.0/15
    if (a === 198 && b >= 18 && b <= 19) {
      return false;
    }

    // Reserved for documentation: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
    if ((a === 192 && b === 0 && c === 2) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113)) {
      return false;
    }

    // Multicast: 224.0.0.0/4
    if (a >= 224 && a <= 239) {
      return false;
    }

    // Reserved: 240.0.0.0/4
    if (a >= 240) {
      return false;
    }

    // Unspecified: 0.0.0.0
    if (a === 0 && b === 0 && c === 0 && d === 0) {
      return false;
    }

    return true;
  }

  // IPv6 validation (basic check for non-private ranges)
  // Loopback: ::1
  if (ip === '::1') {
    return false;
  }

  // Unspecified: ::
  if (ip === '::') {
    return false;
  }

  // Private IPv6 ranges (fc00::/7 - Unique Local)
  if (ip.startsWith('fc') || ip.startsWith('fd')) {
    return false;
  }

  // Link-local: fe80::/10
  if (ip.startsWith('fe8') || ip.startsWith('fe9') || 
      ip.startsWith('fea') || ip.startsWith('feb')) {
    return false;
  }

  // Multicast: ff00::/8
  if (ip.startsWith('ff')) {
    return false;
  }

  // For simplicity, assume other IPv6 addresses are public
  // In production, you might want more comprehensive IPv6 validation
  return ip.includes(':');
}

/**
 * Fetch geolocation data from ipinfo.io Lite API
 * Lite API returns: ip, asn, as_name, as_domain, country_code, country, continent_code
 * Does NOT return: latitude, longitude, city, VPN, proxy, Tor fields
 */
function fetchGeolocation(ip) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.IPINFO_API_KEY;
    
    if (!apiKey) {
      console.error('[Geolocation] IPINFO_API_KEY not set in environment variables');
      return resolve(null);
    }
    
    const url = `https://api.ipinfo.io/lite/${ip}`;
    
    const options = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // Check for API errors
          if (parsed.error) {
            console.warn(`[Geolocation] API error for ${ip}:`, parsed.error);
            return resolve(null);
          }

          // Extract ASN/ISP data (Lite API provides these)
          const asn = {
            asn: parsed.asn || null,
            org: parsed.as_name || null,
            domain: parsed.as_domain || null,
            type: null, // Lite API doesn't provide ASN type
            available: !!(parsed.asn || parsed.as_name)
          };

          // Extract country data (Lite API provides these)
          const country = parsed.country || null;
          const countryCode = parsed.country_code || null;
          const continentCode = parsed.continent_code || null;

            resolve({
            ip,
            lat: null, // Lite API doesn't provide coordinates
            lng: null, // Lite API doesn't provide coordinates
            country: country || 'Unknown',
            country_code: countryCode,
            region: null, // Lite API doesn't provide region
            region_code: null,
            city: null, // Lite API doesn't provide city
            postal: null,
            timezone: null,
            privacy: null, // Lite API doesn't provide privacy detection
            asn,
            continent_code: continentCode,
            status: 'resolved'
          });
        } catch (error) {
          console.error(`[Geolocation] Parse error for ${ip}:`, error.message);
          resolve(null);
        }
      });
    }).on('error', (error) => {
      console.error(`[Geolocation] Network error for ${ip}:`, error.message);
      resolve(null);
    });
  });
}

/**
 * Get geolocation for an IP address with caching
 */
async function getGeolocation(ip) {
  if (!isPublicIp(ip)) {
    return {
      ip,
      status: 'not_public',
      reason: 'IP is not globally routable (private, loopback, or reserved)'
    };
  }

  // Check cache
  const cached = geolocationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Fetch from API
  const result = await fetchGeolocation(ip);

  if (result) {
    // Cache the result
    geolocationCache.set(ip, {
      timestamp: Date.now(),
      data: result
    });
    return result;
  }

  return {
    ip,
    status: 'unavailable',
    reason: 'Geolocation service unavailable or failed'
  };
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [ip, entry] of geolocationCache.entries()) {
    if (now - entry.timestamp >= CACHE_TTL_MS) {
      geolocationCache.delete(ip);
    }
  }
}

// Clear expired cache every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);

module.exports = {
  getGeolocation,
  isPublicIp,
  clearExpiredCache
};
