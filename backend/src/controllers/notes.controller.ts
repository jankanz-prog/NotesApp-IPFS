import { Request, Response } from 'express';
import prisma from '../db';

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { title, content, drawing, color, importance, favorite, folderId } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const note = await prisma.note.create({
      data: {
        userId,
        folderId: folderId || null, // null means default folder
        title,
        content: content || '',
        drawing,
        color,
        importance: importance || 1,
        favorite: favorite || false,
      },
    });

    res.status(201).json({ message: 'Note created', note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getAllNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
};

export const getNoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId, // Ensure user owns the note
      },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({ note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { title, content, drawing, color, importance, favorite, ipfsHash } = req.body;

    console.log('Update request for note:', id);
    console.log('User ID:', userId);
    console.log('Request body:', req.body);

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    console.log('Existing note found:', existingNote);

    if (!existingNote) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Only update fields that are provided (not undefined)
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (drawing !== undefined) updateData.drawing = drawing;
    if (color !== undefined) updateData.color = color;
    if (importance !== undefined) updateData.importance = importance;
    if (favorite !== undefined) updateData.favorite = favorite;
    if (ipfsHash !== undefined) updateData.ipfsHash = ipfsHash;

    console.log('Update data:', updateData);

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    console.log('Note updated successfully:', note);

    res.json({ message: 'Note updated', note });
  } catch (error) {
    console.error('Update note error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    await prisma.note.delete({
      where: { id },
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { favorite: !note.favorite },
    });

    res.json({ message: 'Favorite toggled', note: updatedNote });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
};