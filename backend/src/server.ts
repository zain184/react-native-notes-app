import "reflect-metadata"; // <-- THIS IS THE FIX. MUST BE ON THE FIRST LINE.
import express from 'express';
import { AppDataSource } from './data-source';
import { Note } from './entities/Note';

// Establish database connection
AppDataSource.initialize().then(async () => {
    console.log("Database connection has been initialized.");

    const app = express();
    app.use(express.json()); // Middleware to parse JSON bodies
    const noteRepository = AppDataSource.getRepository(Note);

    // --- API ENDPOINTS ---

    // GET /notes - Get all notes
    app.get('/notes', async (req, res) => {
        const notes = await noteRepository.find();
        res.json(notes);
    });

    // GET /notes/:id - Get a single note by ID
    app.get('/notes/:id', async (req, res) => {
        try {
            // Important: In newer TypeORM versions, findOneBy expects an object.
            const note = await noteRepository.findOneBy({ id: parseInt(req.params.id) });
            if (note) {
                res.json(note);
            } else {
                res.status(404).send({ message: 'Note not found' });
            }
        } catch (error) {
            res.status(500).send({ message: "Error fetching note" });
        }
    });

    // POST /notes - Create a new note
    app.post('/notes', async (req, res) => {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).send({ message: "Title and content are required" });
        }
        const note = noteRepository.create({ title, content });
        const results = await noteRepository.save(note);
        res.status(201).send(results);
    });

    // PUT /notes/:id - Update a note by ID
    app.put('/notes/:id', async (req, res) => {
        try {
            const note = await noteRepository.findOneBy({ id: parseInt(req.params.id) });
            if (note) {
                noteRepository.merge(note, req.body);
                const results = await noteRepository.save(note);
                res.json(results);
            } else {
                res.status(404).send({ message: 'Note not found' });
            }
        } catch (error) {
            res.status(500).send({ message: "Error updating note" });
        }
    });

    // DELETE /notes/:id - Delete a note by ID
    app.delete('/notes/:id', async (req, res) => {
        try {
            const results = await noteRepository.delete(req.params.id);
            if (results.affected && results.affected > 0) {
                res.status(204).send(); // No content
            } else {
                res.status(404).send({ message: 'Note not found' });
            }
        } catch (error) {
            res.status(500).send({ message: "Error deleting note" });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });

}).catch(error => console.log("TypeORM connection error: ", error));