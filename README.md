# 文件服务

## 需求分析

- 增
  - 适配不同的文件存储工具，目前只支持minio。
  - 二进制流上传文件。
  - 分片上传文件。
  - 允许自定义文件名。
    - 允许重名。
    - 允许一个文件有多个文件名。不同文件名对应不同的id，但文件只存一份。
- 删
  - 移除文件。
- 改
  - 修改文件名。
- 查
  - 提供文件临时访问地址。
  - 提供文件信息，包括文件名、文件类型、文件大小、创建时间、更新时间等。
  - 下载断点续传。

## 架构设计

```mermaid
architecture-beta
    group filer_service(cloud)[File Service]

    service db(database)[Database] in filer_service
    service disk(disk)[Storage] in filer_service
    service server(server)[Server] in filer_service
    service minio(server)[Minio] in filer_service

    db:L -- R:server
    disk:L -- R:minio
    server:B -- T:minio
```

## 接口设计

```mermaid
classDiagram
    class FileServiceController {
        +uploadFileByStream(stream: Stream, fileName: string) fileId
        +queryFileChunks(file: File, fileName: string, chunkSize: number) fileId
        +uploadFileChunk(chunk) fileId
        +mergeFileChunks(fileId: string) fileId

        +removeFile(fileId: string)

        +renameFile(fileId: string, newFileName: string)

        +queryFileInfo(fileId: string) fileInfo
    }

    class FileInfo {
        +fileName: string
        +fileSize: number
        +createTime: Date
        +updateTime: Date
    }
```

## 库表设计
