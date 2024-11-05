-- Create the response table if it doesn't exist
create or replace function create_response_table_if_not_exists()
returns void as $$
begin
  create table if not exists response (
    id uuid default uuid_generate_v4() primary key,
    prompt text not null,
    format text not null,
    data_size text not null,
    generated_data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'success',
    metadata jsonb default '{}'::jsonb
  );

  create table if not exists error_logs (
    id uuid default uuid_generate_v4() primary key,
    error jsonb not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    data_sample text
  );
end;
$$ language plpgsql; 