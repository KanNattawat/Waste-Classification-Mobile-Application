import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function proxy(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
    ],
};