-- Migration: Add geolocation fields to wotmed_incidents table
-- This migration adds fields to store IP geolocation data
-- Run this in your Supabase SQL editor or via psql

-- Add geolocation columns to wotmed_incidents table
ALTER TABLE wotmed_incidents
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS region_code TEXT,
ADD COLUMN IF NOT EXISTS postal TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS geolocation_status TEXT,
ADD COLUMN IF NOT EXISTS geolocation_reason TEXT;

-- Add privacy detection columns (Plus/Max API tiers)
ALTER TABLE wotmed_incidents
ADD COLUMN IF NOT EXISTS privacy_vpn BOOLEAN,
ADD COLUMN IF NOT EXISTS privacy_proxy BOOLEAN,
ADD COLUMN IF NOT EXISTS privacy_tor BOOLEAN,
ADD COLUMN IF NOT EXISTS privacy_relay BOOLEAN,
ADD COLUMN IF NOT EXISTS privacy_hosting BOOLEAN,
ADD COLUMN IF NOT EXISTS privacy_service TEXT;

-- Add ASN/ISP columns (Lite tier and above)
ALTER TABLE wotmed_incidents
ADD COLUMN IF NOT EXISTS asn TEXT,
ADD COLUMN IF NOT EXISTS org TEXT,
ADD COLUMN IF NOT EXISTS org_domain TEXT,
ADD COLUMN IF NOT EXISTS asn_type TEXT;

-- Add indexes for common geolocation queries
CREATE INDEX IF NOT EXISTS idx_wotmed_incidents_geolocation_status 
ON wotmed_incidents(geolocation_status);

CREATE INDEX IF NOT EXISTS idx_wotmed_incidents_country 
ON wotmed_incidents(country);

CREATE INDEX IF NOT EXISTS idx_wotmed_incidents_privacy_vpn 
ON wotmed_incidents(privacy_vpn) WHERE privacy_vpn IS TRUE;

-- Add check constraint for valid latitude
ALTER TABLE wotmed_incidents
ADD CONSTRAINT chk_latitude_range 
CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

-- Add check constraint for valid longitude
ALTER TABLE wotmed_incidents
ADD CONSTRAINT chk_longitude_range 
CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Add comment to document the new fields
COMMENT ON COLUMN wotmed_incidents.latitude IS 'Latitude coordinate from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.longitude IS 'Longitude coordinate from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.country IS 'Country name from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.country_code IS 'Country code from IP geolocation (ISO 3166-1 alpha-2)';
COMMENT ON COLUMN wotmed_incidents.city IS 'City name from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.region IS 'Region/state/province from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.region_code IS 'Region code from IP geolocation (ISO 3166-2)';
COMMENT ON COLUMN wotmed_incidents.postal IS 'Postal/zip code from IP geolocation';
COMMENT ON COLUMN wotmed_incidents.timezone IS 'Timezone from IP geolocation (IANA tz database)';
COMMENT ON COLUMN wotmed_incidents.geolocation_status IS 'Status of geolocation: resolved, not_public, unavailable, error';
COMMENT ON COLUMN wotmed_incidents.geolocation_reason IS 'Reason if geolocation failed (e.g., private IP, API error)';
COMMENT ON COLUMN wotmed_incidents.privacy_vpn IS 'True if IP is a VPN exit node (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.privacy_proxy IS 'True if IP is an open web proxy (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.privacy_tor IS 'True if IP is a Tor exit node (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.privacy_relay IS 'True if IP is an anonymous relay service (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.privacy_hosting IS 'True if IP is a hosting/cloud/data center (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.privacy_service IS 'Name of privacy service provider (e.g., NordVPN) (Plus/Max API tier)';
COMMENT ON COLUMN wotmed_incidents.asn IS 'Autonomous System Number (ASN) (Lite tier and above)';
COMMENT ON COLUMN wotmed_incidents.org IS 'Organization name from ASN (Lite tier and above)';
COMMENT ON COLUMN wotmed_incidents.org_domain IS 'Organization domain from ASN (Lite tier and above)';
COMMENT ON COLUMN wotmed_incidents.asn_type IS 'ASN type: ISP, Hosting, Education, Government, Business (Lite tier and above)';
