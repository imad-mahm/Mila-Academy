-- Adds a column to track each photo's storage path, so deleting a row can
-- also clean up the actual file in the 'gallery' storage bucket.
alter table gallery_photos add column if not exists storage_path text;
