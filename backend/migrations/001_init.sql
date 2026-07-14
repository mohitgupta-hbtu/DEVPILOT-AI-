-- DevPilot AI — Developer Workspace schema (Milestone 6)
-- Run in the Supabase SQL editor, or via: psql "$DATABASE_URL" -f migrations/001_init.sql

create extension if not exists "pgcrypto";

create table if not exists users (
    id               bigint generated always as identity primary key,
    github_id        bigint unique not null,
    username         text not null,
    display_name     text,
    avatar_url       text,
    email            text,
    bio              text,
    created_at       timestamptz not null default now(),
    last_login       timestamptz not null default now()
);
create index if not exists idx_users_username on users (username);

create table if not exists user_settings (
    user_id            bigint primary key references users (id) on delete cascade,
    theme              text not null default 'system',
    ai_provider        text not null default 'openai',
    language           text not null default 'en',
    email_notifications boolean not null default true,
    product_updates     boolean not null default true,
    public_profile      boolean not null default false,
    updated_at         timestamptz not null default now()
);

create table if not exists saved_analyses (
    id                bigint generated always as identity primary key,
    user_id           bigint not null references users (id) on delete cascade,
    repo_url          text not null,
    repo_name         text not null,
    analysis_date     timestamptz not null default now(),
    health_score      integer,
    ai_summary        text,
    tech_stack        text,
    learning_roadmap  text,
    commit_sha        text,
    created_at        timestamptz not null default now()
);
create index if not exists idx_saved_analyses_user on saved_analyses (user_id);
create index if not exists idx_saved_analyses_repo on saved_analyses (repo_url);

create table if not exists favorites (
    id                bigint generated always as identity primary key,
    user_id           bigint not null references users (id) on delete cascade,
    repo_url          text not null,
    repo_name         text not null,
    repo_owner        text,
    note              text,
    created_at        timestamptz not null default now()
);
create index if not exists idx_favorites_user on favorites (user_id);
create index if not exists idx_favorites_repo on favorites (repo_url);
