export function matchNLE(name: 'ignore-server') {
  return import.meta.env.npm_lifecycle_event === name
}
