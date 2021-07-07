BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined) values ('test', 'test@test.com', 5 , '2021-01-01');
INSERT into login (hash, email) values ('$2y$12$pYxnCxmgPB9SzfGkOI3alOPR5Wt9M15./14ResQ9eFhp4/ROO7NwK', 'test@test.com');

COMMIT;