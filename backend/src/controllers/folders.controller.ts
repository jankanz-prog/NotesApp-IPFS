import { Request, Response } from 'express';
import prisma from '../db';

export const getFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const folders = await prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ folders });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { name, color } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Folder name is required' });
      return;
    }

    const folder = await prisma.folder.create({
      data: {
        userId,
        name,
        color: color || null,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

export const updateFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, color } = req.body;

    // Check if folder exists and belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!existingFolder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;

    const folder = await prisma.folder.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });

    res.json({ message: 'Folder updated', folder });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if folder exists and belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!existingFolder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    // Delete folder (notes will have folderId set to null due to onDelete: SetNull)
    await prisma.folder.delete({
      where: { id },
    });

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

export const getFolderNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if folder exists and belongs to user
    const folder = await prisma.folder.findFirst({
      where: { id, userId },
      include: {
        notes: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }

    res.json({ folder, notes: folder.notes });
  } catch (error) {
    console.error('Get folder notes error:', error);
    res.status(500).json({ error: 'Failed to fetch folder notes' });
  }
};
