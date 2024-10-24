# 文件服务

## 需求分析

- 增
  - 适配不同的文件存储服务，目前只需支持minio。
  - 以二进制流的形式上传文件。
  - 分片上传文件。
  - 允许自定义文件名。
    - 允许重名。
    - 允许内容相同的文件有多个文件名。不同文件名对应不同的id，但文件只存一份。
  - 限制上传文件类型、大小等。
- 删
  - 移除文件记录。
  - 在存储服务中移除文件。
- 查
  - 提供文件临时访问地址。
  - 提供文件信息，包括文件名、文件大小和创建时间等。
  - 下载断点续传。

## 架构设计

```mermaid
architecture-beta
    %% file_service
    group file_service(cloud)[File Service]
    service server(server)[Server] in file_service
    service database(database)[Database] in file_service

    server:B -- T:database
    server:R -- L:minio

    %% s3_service
    group s3_service[S3 Service] in file_service
    service minio(server)[Minio] in s3_service
    service disk(disk)[Disk] in s3_service

    minio:B -- T:disk
```

## 接口设计

> 文件hash值使用md5算法计算，因为minio仅支持md5算法。

```mermaid
classDiagram
    note for FileServiceController "请求文件分片地址时若已存在相同文件的分片方案，则返回现有分片信息。\n上传文件时若已存在相同内容的文件，仍新增记录。"
    FileServiceController ..> FileInfo
    FileServiceController ..> FileChunk
    FileServiceController ..> FileUrl
    class FileServiceController {
        %% create
        +uploadFileByBlob(fileData: blob, fileHash: string, fileName: string) fileInfo
        +uploadFileByHash(fileHash: string, fileName: string) fileInfo
        +requestFileChunks(fileHash: string, preferChunkCount: number) fileChunk[]
        +uploadFileChunk(chunkData: blob, chunkIndex: number, chunkHash: string)
        +mergeFileChunks(fileHash: string, fileName: string) fileInfo
        %% delete
        +removeFile(fileId: string)
        %% query
        +queryFileInfo(fileId: string) fileInfo
        +queryFileUrls(fileIds: string[]) FileUrl[]
        +isFileUploaded(fileHash: string) boolean
    }

    note for FileInfo "若非首次上传文件，则uploadTime为本次上传时间。"
    class FileInfo {
        +id: string
        +name: string
        +size: number
        +uploadTime: Date
    }

    class FileChunk {
        +index: number
        +uploaded: boolean
    }

    class FileUrl {
        +url: string
        +id: string
        +name: string
        +size: number
        +uploadTime: Date
    }
```

## 库表设计

```mermaid
erDiagram
    FILES {
        bigint id PK
        varchar(255) name
        varchar(32) hash
        int size "以字节为单位"
        timestamp create_time
        timestamp upload_time
        boolean deleted
    }

    CHUNKS {
        integer index PK
        varchar(32) file_hash PK
        timestamp create_time
        timestamp upload_time
        boolean uploaded
        boolean deleted
    }
```

## 流程设计

### 客户端上传文件

```mermaid
flowchart LR
    start(开始) --> s1

    s1[准备文件信息] --> s2

    s2[计算文件hash值] --> s4

    s4{文件已上传}
    s4 --Y--> s5
    s4 --N--> s6

    s5[调用uploadFileByHash上传文件] --> finish

    s6[调用uploadFileByBlob上传文件] --> finish

    finish(结束)
```

### 客户端分片上传文件

```mermaid
flowchart LR
    start(开始) --> s1

    s1[准备文件信息] --> s2

    s2[计算文件hash值] --> s4

    s4{文件已上传}
    s4 --Y--> s5
    s4 --N--> s6

    s5[调用uploadFileByHash上传文件] --> finish

    s6[获取文件分片信息] --> s7

    s7[上传所有分片] --> s8

    s8[合并分片] --> finish

    finish(结束)
```

### uploadFileByBlob

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收文件信息] --> s3

    s3{文件已上传}
    s3 --Y--> s4
    s3 --N--> s5

    s4[保存文件信息到数据库] --> finish

    s5[保存文件到minio] --> s6

    s6[检查hash值是否正确] --> s7

    s7{hash值正确}
    s7 --Y--> s4
    s7 --N--> s9

    s9[返回错误信息] --> s10

    s10[从minio移除该文件] --> finish

    finish(结束)
```

### uploadFileByHash

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收文件信息] --> s3

    s3{文件已上传}
    s3 --Y--> s4
    s3 --N--> s5

    s4[保存文件信息到数据库]
    s4 --> finish

    s5[返回错误信息]
    s5 --> finish
```

### requestFileChunks

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收信息] --> s3

    s3{文件已上传}
    s3 --Y--> s4
    s3 --N--> s6

    s4[返回错误信息] --> finish

    s6{文件分片方案已存在}
    s6 --Y--> s7
    s6 --N--> s8

    s7[返回现有方案] --> finish

    s8[创建分片方案，存入数据库] --> finish

    finish(结束)
```

### uploadFileChunk

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收信息] --> s3

    s3{分片已上传}
    s3 --Y--> finish
    s3 --N--> s4

    s4[上传分片到minio] --> s6

    s6{hash值正确}
    s6 --Y--> s7
    s6 --N--> s8

    s7[修改数据库分片信息] --> finish

    s8[返回错误信息] --> finish

    finish(结束)
```

### mergeFileChunks

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收信息] --> s3

    s3{文件已上传}
    s3 --Y--> s4
    s3 --N--> s5

    s4[保存文件信息到数据库] --> finish

    s5[合并分片] --> s7

    s7{文件hash值正确}
    s7 --Y--> s4
    s7 --N--> s8

    s8[返回错误信息] --> s9

    s9[从minio移除所有分片] --> finish

    finish(结束)
```

### removeFile

```mermaid
flowchart LR
    start(开始) --> s1

    s1[接收信息] --> s3

    s3{文件记录存在}
    s3 --Y--> s4
    s3 --N--> s5

    s5[返回错误信息] --> finish

    s4[移除文件记录] --> s7

    s7{存在同hash值的文件记录}
    s7 --Y--> finish
    s7 --N--> s8

    s8[删除minio中对应文件] --> finish

    finish(结束)
```
