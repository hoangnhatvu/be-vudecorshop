import { extname } from 'path'

export const fileFilter = (req, file, cb) => {
  const ext = extname(file.originalname)
  const allowedExtArr = ['.jpg', '.png', '.jpeg', '.glb', '.JPG', '.PNG', '.JPEG', '.GLB']
  if (!allowedExtArr.includes(ext)) {
    req.fileValidationError = `Sai định dạng. Định dạng cho phép: ${allowedExtArr.toString()}`
    cb(null, false)
  } else {
    const fileSize = parseInt(req.headers['content-length'])

    if (fileSize > 1024 * 1024 * 100) {
      req.fileValidationError = 'Kích thước file quá lớn. Chỉ chấp nhận kích thước nhỏ hơn 100 mb'
      cb(null, false)
    } else {
      cb(null, true)
    }
  }
}
