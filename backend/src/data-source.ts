import "reflect-metadata";
import { DataSource } from "typeorm";
import { Note } from "./entities/Note";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite", // This will create a file named database.sqlite
    synchronize: true, // Automatically creates database schema on every application launch. Good for development, but use migrations for production.
    logging: false,
    entities: [Note],
    migrations: [],
    subscribers: [],
});