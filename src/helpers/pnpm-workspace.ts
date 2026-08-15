export interface PnpmWorkspace {
  [key: string]: unknown
  catalog?: Record<string, string>
  catalogs?: Record<string, Record<string, string>>
}

export async function parsePnpmWorkspace(payload: string): Promise<PnpmWorkspace> {
  return (await import("yaml")).parse(payload) as PnpmWorkspace;
}
