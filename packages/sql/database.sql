CREATE DATABASE `canteen`;

CREATE TABLE 'users' (
  "id" BIGINT PRIMARY KEY,
  "name" VARCHAR(1024) NOT NULL,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "password" VARCHAR(72) NOT NULL,
);

CREATE TABLE `cards` (
  "id" BIGINT PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  "card_number" VARCHAR(19) NOT NULL,
  "expiry_date" DATE NOT NULL,
  "name_on_card" VARCHAR(100) NOT NULL,
);

CREATE TABLE `menu` (
  "id" BIGINT PRIMARY KEY,
  "date" DATE NOT NULL,
);

CREATE TABLE `foods` (
  "id" BIGINT PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" VARCHAR(2048) NOT NULL,
  "picture_id" VARCHAR(40) NOT NULL,
  "price" INT NOT NULL,
);

CREATE TABLE `allergens` (
  "id" BIGINT PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "icon_id" VARCHAR(10) NOT NULL,
);

CREATE TABLE `orders` (
  "id" BIGINT PRIMARY KEY,
  "user_id" BIGINT NOT NULL,
  "menu_id" BIGINT NOT NULL,
  "food_id" BIGINT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE `menu_choices` (
  "menu_id" BIGINT NOT NULL REFERENCES "menu"("id"),
  "food_id" BIGINT NOT NULL REFERENCES "foods"("id"),
);

CREATE TABLE `food_allergens` (
  "food_id" BIGINT NOT NULL REFERENCES "foods"("id"),
  "allergen_id" BIGINT NOT NULL REFERENCES "allergens"("id"),
);