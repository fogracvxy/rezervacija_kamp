CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(28) NOT NULL UNIQUE,
    passhash VARCHAR NOT NULL,
    profileimg TEXT,
    mail VARCHAR NOT NULL UNIQUE,
	ime VARCHAR NOT NULL,
	prezime VARCHAR NOT NULL
);
create type user_role as enum(
  'Admin',
  'User'
);
alter table users drop column role;
alter table users add column role user_role NOT NULL default 'User';
Update users set role='Admin' where username='MSpudic';