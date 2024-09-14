# 文件服务

## 需求分析

- 增
  - 适配不同的文件存储工具，目前只支持minio。
  - 二进制流上传文件。
  - 分片上传文件。
  - 允许自定义文件名。
    - 允许重名。
    - 允许一个文件有多个文件名。不同文件名对应不同的id，但文件只存一份。
  - 限制上传文件类型、大小等。
- 删
  - 移除文件。
- 查
  - 提供文件临时访问地址。
  - 提供文件信息，包括文件名、文件大小、创建时间等。
  - 下载断点续传。

## 架构设计

```mermaid
architecture-beta
    group file_service(cloud)[File Service]

    service db(database)[Database] in file_service
    service disk(disk)[Storage] in file_service
    service server(server)[Server] in file_service
    service minio(server)[Minio] in file_service

    db:L -- R:server
    disk:L -- R:minio
    server:B -- T:minio
```

## 接口设计

```mermaid
classDiagram
    note for FileServiceController "请求文件分片地址时若已有相同文件的分片，则返回已有分片信息"
    FileServiceController ..> FileInfo
    FileServiceController ..> FileChunk
    class FileServiceController {
        +uploadFileByStream(fileName: string, fileData: binaryStream) fileInfo
        +requestFileChunks(fileHash: string, preferChunkCount: number) fileChunk[]
        +uploadFileChunk(uploadUrl: string, chunk: binaryStream)
        +mergeFileChunks(fileHash: string, fileName: string) fileInfo

        +removeFile(fileId: string)

        +queryFileInfo(fileId: string) fileInfo
        +isFileUploaded(fileHash: string) boolean
    }

    class FileInfo {
        +id: string
        +name: string
        +size: number
        +uploadTime: Date
    }

    class FileChunk {
        +uploadUrl: string
        +uploaded: boolean
    }
```

## 库表设计

```mermaid
erDiagram
    FILE_INFO {
        bigint id PK
        varchar(256) name
        varchar(512) hash
        int size "以字节为单位"
        time create_time
        time upload_time
        boolean uploaded
    }

    CHUNK {
        varchar(128) upload_url PK
        varchar(512) file_hash
        time create_time
        time upload_time
        boolean uploaded
    }
```
