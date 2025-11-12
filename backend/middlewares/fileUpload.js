import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {app} from 'electron'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const code = req.params.code;
        let uploadPath;

        // Set upload path based on field name
        // if (file.fieldname === 'sign' || file.fieldname === 'avatar') {
        // uploadPath = process.env.NODE_ENV === 'development' ? path.join(__dirname, `../../assets/images/${code}`) : path.join(process.resourcesPath, `assets/images/${code}`);
        uploadPath = path.join(app.getPath('userData'), `uploads/${code}`);

        //     path.join(__dirname, `../../public/staff/${code}`);
        // } else if (file.fieldname === 'photo') {
        //     uploadPath = path.join(__dirname, `../../public/students/${code}`);
        // } else if (file.fieldname === 'logo' || file.fieldname === 'calligraphy' || file.fieldname === 'academicPhoto') {
        //     uploadPath = path.join(__dirname, `../../public/images/${code}`);
        // }

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploadFiles = (fields, sizeLimit) => {
    return multer({
        storage,
        limits: {fileSize: sizeLimit ? sizeLimit : 0.5 * 1024 * 1024},
    }).fields(fields);
};

export { uploadFiles };
