"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const s3_1 = require("../config/s3");
const type_1 = require("../types/type");
// POST /upload/presigned-url 🔒 instructor
const getPresignedUrl = async (req, res) => {
    const { fileName, fileType, folder } = req.body;
    if (!fileName || !fileType || !folder) {
        res.status(400).json({ message: 'fileName, fileType, and folder are required' });
        return;
    }
    if (!type_1.VALID_S3_FOLDERS.includes(folder)) {
        res.status(400).json({ message: `Invalid folder. Must be one of: ${type_1.VALID_S3_FOLDERS.join(', ')}` });
        return;
    }
    const ext = fileName.split('.').pop();
    const key = `${folder}/${(0, uuid_1.v4)()}.${ext}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: s3_1.S3_BUCKET,
        Key: key,
        ContentType: fileType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3, command, { expiresIn: 3600 });
    res.json({ uploadUrl, key, expiresIn: 3600 });
};
exports.getPresignedUrl = getPresignedUrl;
//# sourceMappingURL=upload.controller.js.map