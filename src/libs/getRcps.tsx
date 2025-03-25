import { RcpJson } from '../interface';

export default async function getRcps(): Promise<RcpJson> {
  // Add 300ms delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const response = await fetch('http://localhost:5000/api/v1/rentalCarProviders');
  if (!response.ok) {
    throw new Error('Failed to fetch venues');
  }
  return response.json();
} 
