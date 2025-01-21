import assert from 'assert'

export const validateFileType = (
  fileName: string,
  acceptedFileTypes: string[]
) => {
  const fileExtension = '.' + fileName.split('.').pop()
  assert(
    fileExtension && acceptedFileTypes.includes(fileExtension),
    '不支持上传该文件类型'
  )
}
