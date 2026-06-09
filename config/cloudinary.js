const cloudinary = require('cloudinary').v2;

if (process.env.CLOUDINARY_URL) {
    const matches = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/(\d+):(.+)@(.+)/);
    if (matches) {
        cloudinary.config({
            cloud_name: matches[3],
            api_key: matches[1],
            api_secret: matches[2]
        });
    }
} else {
    cloudinary.config({ 
        cloud_name: 'do1lnw3ik', 
        api_key: '395376976994413', 
        api_secret: process.env.CLOUDINARY_API_SECRET || ''
    });
}

module.exports = cloudinary;
