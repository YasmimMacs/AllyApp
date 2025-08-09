import { get } from 'aws-amplify/api';

export async function listItems() {
  try {
    const res = await get({
      apiName: 'allyapi',
      path: '/v1/items'
    });
    const response = await res.response;
    return response.body as unknown as { id: number; name: string }[];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [] as { id: number; name: string }[];
  }
}


