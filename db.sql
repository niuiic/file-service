CREATE TABLE IF NOT EXISTS public.file_info (
    id BIGINT PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    hash VARCHAR(32) NOT NULL,
    size INT NOT NULL,
    create_time TIMESTAMP NOT NULL,
    upload_time TIMESTAMP NOT NULL,
    deleted BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chunk_info (
    "index" INTEGER NOT NULL,
    file_hash VARCHAR(32) NOT NULL,
    create_time TIMESTAMP NOT NULL,
    upload_time TIMESTAMP,
    uploaded BOOLEAN NOT NULL,
    deleted BOOLEAN NOT NULL,
    PRIMARY KEY ("index", file_hash)
);