// Location: backend/src/entities/Note.ts

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Note {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text") // We are explicitly telling TypeORM this is a text column
    title: string;

    @Column("text") // And this one too
    content: string;
}