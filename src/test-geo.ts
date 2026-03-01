import geoip from 'geoip-lite';
const ip = "8.8.8.8";
const geo = geoip.lookup(ip);
console.log(`Geo for ${ip}:`, geo);
if (!geo) {
    console.log("Geo lookup failed. Check if geoip-lite data is present.");
}
