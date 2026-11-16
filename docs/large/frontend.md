# Frontend

## Components

- Components should be small and do one thing.
- Shared components must live in the common components folder.
- Components must not contain business rules. Move them to services.
- Event handlers should be named with a handle prefix.

## State

- Global state should be avoided for data that only one page uses.
- Server data must be cached and invalidated after mutations.
- Form state should use the shared form library.

## Accessibility

- Interactive elements must be reachable by keyboard.
- Images must have alternative text.
- Color must not be the only way to convey information.
- Modal dialogs must trap focus while open.

## Performance

- Images should be compressed before they are committed.
- Large libraries should be loaded only on the pages that need them.
- Lists with more than 100 items should be virtualized.
