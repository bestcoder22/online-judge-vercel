import multer from "multer";

const avatar_upload = multer({ dest: 'avatar/' });

export default avatar_upload;