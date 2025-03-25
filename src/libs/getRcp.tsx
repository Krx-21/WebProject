import { RcpItem } from '@/interface';
import { notFound } from 'next/navigation';

export default async function getRcp(id: string) {
    try {
        const response = await fetch(`http://localhost:5000/api/v1/rentalCarProviders/${id}`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch venue');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching venue:', error);
        notFound();
    }
} 

