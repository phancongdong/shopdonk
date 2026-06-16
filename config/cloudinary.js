const cloudinary = require('cloudinary').v2;

function initCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (process.env.CLOUDINARY_URL) {
        const matches = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(.+)@(.+)/);
        if (matches) {
            cloudinary.config({
                cloud_name: matches[3],
                api_key: matches[1],
                api_secret: matches[2]
            });
            return true;
        }
    }
    
    if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });
        return true;
    }
    
    console.warn('[WARNING] Cloudinary credentials not configured. Image upload will not work.');
    return false;
}

initCloudinary();

module.exports = cloudinary;
