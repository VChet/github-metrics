import type { PackageJson } from "type-fest";
import type { PnpmWorkspace } from "./pnpm-workspace";
import type { Dependencies } from "./repo";

function isUnresolvableDependency(specifier: string): boolean {
  return (
    specifier.startsWith("npm:") ||
    specifier.startsWith("link:") ||
    specifier.startsWith("file:") ||
    specifier.startsWith("workspace:")
  );
}

function resolveCatalog(name: string, specifier: string, workspace?: PnpmWorkspace): string | undefined {
  if (!workspace) return undefined;

  const catalogName = specifier.slice("catalog:".length);
  if (!catalogName) return workspace.catalog?.[name];

  return workspace.catalogs?.[catalogName]?.[name];
}

function resolveDependency(name: string, specifier: string, workspace?: PnpmWorkspace): string | undefined {
  if (isUnresolvableDependency(specifier)) return undefined;
  if (specifier.startsWith("catalog:")) return resolveCatalog(name, specifier, workspace);
  return specifier;
}

export function resolveDependencies(
  { dependencies, devDependencies }: PackageJson,
  workspace?: PnpmWorkspace
): Dependencies {
  const result: Dependencies = {};

  for (const [name, specifier] of Object.entries({ ...dependencies, ...devDependencies })) {
    if (!specifier) continue;
    const version = resolveDependency(name, specifier, workspace);
    if (version) result[name] = version;
  }

  return result;
}
