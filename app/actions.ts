
'use server'

import { prisma } from '../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Project, UserRole } from '../types';
import bcrypt from 'bcryptjs';

/**
 * AUTHENTICATION ACTIONS
 */

export async function registerAction(data: any) {
  const { username, password, role } = data;
  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { success: false, error: 'User already exists in corporate ledger.' };

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role as string,
      }
    });
    return { success: true };
  } catch (e) {
    console.error('Registration Error:', e);
    return { success: false, error: 'Database connection failed.' };
  }
}

export async function loginAction(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { success: false, error: 'Invalid corporate credentials' };
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      const sessionUser = { username: user.username, role: user.role as UserRole };
      
      const cookieStore = await cookies();
      cookieStore.set('ledger_session', JSON.stringify(sessionUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return { success: true, user: sessionUser };
    }
    return { success: false, error: 'Invalid corporate credentials' };
  } catch (e) {
    console.error('Login Error:', e);
    return { success: false, error: 'Auth system offline' };
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('ledger_session');
  return session ? JSON.parse(session.value) : null;
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('ledger_session');
}

/**
 * PROJECT ACTIONS
 */

export async function getProjectsAction() {
  try {
    const data = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Serialize dates for client consumption
    const serializedData = data.map(p => ({
      ...p,
      startDate: p.startDate.toISOString().split('T')[0],
      endDate: p.endDate.toISOString().split('T')[0],
      billSubmissionDate: p.billSubmissionDate?.toISOString().split('T')[0] || '',
      sopRoiEmailSubmissionDate: p.sopRoiEmailSubmissionDate?.toISOString().split('T')[0] || '',
      createdAt: p.createdAt.toISOString(),
    }));

    return { success: true, data: serializedData as any[] };
  } catch (e) {
    console.error('Fetch Error:', e);
    return { success: false, error: 'Failed to fetch projects' };
  }
}

export async function createProjectAction(project: Project) {
  try {
    const balanceAmount = project.advanceAmount - project.expenseAmount;
    
    const data = {
      name: project.name,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      budgetAmount: project.budgetAmount,
      advanceAmount: project.advanceAmount,
      expenseAmount: project.expenseAmount,
      balanceAmount: balanceAmount,
      billSubmissionDate: project.billSubmissionDate ? new Date(project.billSubmissionDate) : null,
      sopRoiEmailSubmissionDate: project.sopRoiEmailSubmissionDate ? new Date(project.sopRoiEmailSubmissionDate) : null,
      billTopSheetImage: project.billTopSheetImage as any || null,
      budgetCopyAttachment: project.budgetCopyAttachment as any || null,
    };

    await prisma.project.create({
      data: { ...data, id: crypto.randomUUID() }
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Create Error:', e);
    return { success: false, error: 'Failed to create project' };
  }
}

export async function updateProjectAction(project: Project) {
  try {
    const balanceAmount = project.advanceAmount - project.expenseAmount;
    
    const data = {
      name: project.name,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      budgetAmount: project.budgetAmount,
      advanceAmount: project.advanceAmount,
      expenseAmount: project.expenseAmount,
      balanceAmount: balanceAmount,
      billSubmissionDate: project.billSubmissionDate ? new Date(project.billSubmissionDate) : null,
      sopRoiEmailSubmissionDate: project.sopRoiEmailSubmissionDate ? new Date(project.sopRoiEmailSubmissionDate) : null,
      billTopSheetImage: project.billTopSheetImage as any || null,
      budgetCopyAttachment: project.budgetCopyAttachment as any || null,
    };

    if (!project.id) {
       return { success: false, error: 'Project ID is required for update' };
    }

    await prisma.project.update({
      where: { id: project.id },
      data
    });

    revalidatePath('/');
    return { success: true };
  } catch (e) {
    console.error('Update Error:', e);
    return { success: false, error: 'Failed to update project' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Deletion failed' };
  }
}
