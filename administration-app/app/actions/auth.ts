'use server'
import { cookies } from 'next/headers';

export async function loginAction(token: string) {
    const cookieStore = await cookies();

    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 3600
    });
}

export async function getCookie() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('token');
    
    if (!cookie) {
        return null
    }
    return cookie.value;
}
    
export async function deleteCookie(){
    const cookieStore = await cookies();
    cookieStore.delete('token');
}