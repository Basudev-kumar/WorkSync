const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure cloudinary using env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taskme_profiles', // Cloudinary folder name
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

// File filter (optional but good for unified error messages)
const fileFilter = (req,file,cb) =>{
    const allowedTypes = ['image/jpeg','image/png','image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    } else {
        cb(new Error ('only .jpeg , .jpg and .png formats are allowed'),false);
    }
};

const upload = multer({storage, fileFilter});

module.exports = upload;