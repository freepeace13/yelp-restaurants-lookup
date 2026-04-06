export async function cityFromIp(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      region_code?: string;
    };
    if (data.city && data.region_code) {
      return `${data.city}, ${data.region_code}`;
    }
    if (data.city) return data.city;
  } catch {
    return null;
  }
  return null;
}
