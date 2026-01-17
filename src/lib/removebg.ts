export async function removeBackground(imageFile: File): Promise<Blob> {
  const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error('Remove.bg API key not configured. Please add VITE_REMOVE_BG_API_KEY to your .env file');
  }

  const formData = new FormData();
  formData.append('image_file', imageFile);
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.errors?.[0]?.title || 'Failed to remove background';
    throw new Error(errorMessage);
  }

  return await response.blob();
}

export async function removeBackgroundFromUrl(imageUrl: string): Promise<Blob> {
  const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error('Remove.bg API key not configured. Please add VITE_REMOVE_BG_API_KEY to your .env file');
  }

  const formData = new FormData();
  formData.append('image_url', imageUrl);
  formData.append('size', 'auto');

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.errors?.[0]?.title || 'Failed to remove background';
    throw new Error(errorMessage);
  }

  return await response.blob();
}
