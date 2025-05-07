export async function fetchProjects() {
  // サーバーコンポーネントでは完全なURLが必要なため、相対パスではなく絶対パスを使用
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window === 'undefined' ? process.env.NEXT_API_BASE_URL : '');

  const res = await fetch(`${baseUrl}/api/projects`, {
    next: { revalidate: 0 }, // キャッシュを使用せず常に最新データを取得
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }

  return res.json();
}

export async function deleteProject(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window === 'undefined' ? process.env.NEXT_API_BASE_URL : '');

  const res = await fetch(`${baseUrl}/api/projects/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete project');
  }

  return res.json();
}

export async function createProject(data: { name: string; description: string }) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window === 'undefined' ? process.env.NEXT_API_BASE_URL : '');

  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create project');
  }

  return res.json();
}
