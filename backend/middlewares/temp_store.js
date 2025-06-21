import multer from "multer";

const testcase_upload = multer({ storage: multer.memoryStorage() });

export default testcase_upload;