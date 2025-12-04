'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleFavorite(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  try {
    const existingFavorite = await prisma.user.findFirst({
      where: {
        id: userId,
        favorites: {
          some: {
            id: projectId,
          },
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            disconnect: { id: projectId },
          },
        },
      });
      return { isFavorited: false };
    } else {
      // Add to favorites
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            connect: { id: projectId },
          },
        },
      });
      return { isFavorited: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to toggle favorite');
  } finally {
    revalidatePath('/');
    revalidatePath('/projects');
  }
}
