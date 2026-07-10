CREATE TABLE users
(
    id                           TEXT PRIMARY KEY,
    username                     TEXT     UNIQUE,
    password                     TEXT    ,
    contact                      TEXT,
    role                         TEXT    ,
    is_active                    BOOLEAN  DEFAULT 1,
    is_verified                  BOOLEAN  DEFAULT 0,

    verification_otp             INTEGER,
    verification_generated_on    TEXT,

    forget_password_uuid         TEXT,
    forget_password_generated_on TEXT,
    refresh_token                TEXT,
    refresh_token_generated_on   TEXT,
    refresh_token_expires_on     TEXT
);

CREATE TABLE visitors
(
    id                     TEXT PRIMARY KEY,

    visitor_contact        TEXT UNIQUE,
    visitor_name           TEXT    ,
    visitor_image          TEXT,

    has_children_in_school BOOLEAN  DEFAULT 0,
    last_visited_on        TEXT,

    banned_on              TEXT,
    is_visitor_banned      BOOLEAN  DEFAULT 0,
    ban_reason             TEXT,

    address_city           TEXT,
    address_pin_code       TEXT,
    address_line1          TEXT
);

CREATE TABLE visitor_children
(
    id         TEXT PRIMARY KEY,
    visitor_id TEXT ,
    name       TEXT ,
    standard   TEXT,

    FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE CASCADE
);

CREATE TABLE visiting_records
(
    id           TEXT PRIMARY KEY,
    visitor_id   TEXT ,
    visited_on   TEXT ,
    reason       TEXT,
    visitor_host TEXT,
    status       TEXT ,
    note         TEXT,

    FOREIGN KEY (visitor_id) REFERENCES visitors (id) ON DELETE CASCADE
);
CREATE TABLE telegram_ids
(
    id           TEXT PRIMARY KEY,
    host_name    TEXT ,
    chat_id      TEXT  UNIQUE,
    role         TEXT ,
    date_of_join TEXT
);
CREATE TABLE app_settings
(
    id                   INTEGER PRIMARY KEY CHECK (id = 1),
    organization_name    TEXT,
    organization_type    TEXT,
    organization_address TEXT,
    organization_phone   TEXT,
    organization_email   TEXT,
    logo_path            TEXT
);
CREATE TABLE invalid_jwt
(
    id         TEXT PRIMARY KEY,
    token      TEXT,
    expires_at TEXT
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_refresh_token ON users (refresh_token);

CREATE INDEX idx_visitors_contact ON visitors (visitor_contact);
CREATE INDEX idx_visitors_name ON visitors (visitor_name);
CREATE INDEX idx_visitor_children_visitor_id ON visitor_children (visitor_id);
CREATE INDEX idx_visitor_children_name ON visitor_children (name);

CREATE INDEX idx_visiting_records_visitor_id ON visiting_records (visitor_id);
CREATE INDEX idx_visiting_records_status ON visiting_records (status);
CREATE INDEX idx_visiting_records_visited_on ON visiting_records (visited_on);
CREATE INDEX idx_visiting_records_host ON visiting_records (visitor_host);

CREATE INDEX idx_telegram_ids_chat_id ON telegram_ids (chat_id);
CREATE INDEX idx_invalid_jwt_token ON invalid_jwt (token);
CREATE INDEX idx_invalid_jwt_expires_at ON invalid_jwt (expires_at);
