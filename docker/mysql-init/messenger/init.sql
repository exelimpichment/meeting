CREATE DATABASE IF NOT EXISTS messenger_db_test;
GRANT ALL PRIVILEGES ON messenger_db_test.* TO 'test_user' @'%';
FLUSH PRIVILEGES;