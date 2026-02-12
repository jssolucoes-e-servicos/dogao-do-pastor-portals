import { IUserPartner } from '@/common/interfaces/user-partner.interface';
import { cookies } from 'next/headers';

export async function getPartnerSession() {
  const cookieStore = await cookies();
  
  const token = cookieStore.get('ddp-prt-00')?.value;
  const userJson = cookieStore.get('ddp-prt-01')?.value;

  if (!token || !userJson) {
    return null;
  }

  try {
    const user: IUserPartner = JSON.parse(userJson);
    return { token, user };
  } catch (error) {
    return null;
  }
}