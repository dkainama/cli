// This file is managed by Shoutem CLI
// You should not change it
import pack from './package.json';

// screens imports
{{{screensImports}}}

// themes imports
{{{themesImports}}}

export const screens = {
{{screensNames}}
};

export const themes = {
{{themesNames}}
};

export function ext(resourceName) {
  return resourceName ? `${pack.name}.${resourceName}` : pack.name;
}
