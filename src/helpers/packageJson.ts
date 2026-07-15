import type { PackageJson } from "type-fest";

export type PackageManager = "npm" | "pnpm" | "yarn";

export function getDependencies({ dependencies, devDependencies }: PackageJson): PackageJson.Dependency {
  return { ...dependencies, ...devDependencies };
}

export function getPackageManager({ packageManager }: PackageJson): PackageManager | undefined {
  if (!packageManager) return undefined;
  const [manager] = packageManager.match(/^[^@]+/) ?? [];
  return manager as PackageManager | undefined;
}
