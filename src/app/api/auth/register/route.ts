import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await (prisma.user as any).findFirst({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await (prisma.user as any).create({
            data: {
                username,
                password: hashedPassword,
                name: username,
                email: `${username}@user.local`, // Fix: Add dummy email to bypass DB constraint
            },
        });

        return NextResponse.json(
            { message: 'User registered successfully', userId: newUser.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
