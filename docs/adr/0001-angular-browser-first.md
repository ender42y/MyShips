# 1. Build MyShips as an Angular browser game first

Status: Accepted (2026-10-15)

## Context

MyShips is an idle game that is mostly menus, numbers and progress bars. Idle games traditionally live in a browser tab (Cookie Clicker started there), and players leave them open in the background. A mobile version may come later. The developer works in TypeScript and Angular day to day.

## Decision

Build the game as an Angular single-page app that runs in the browser and saves to local storage. No game engine, no backend, no app store for version 1.

## Consequences

- Fastest path to something playable and shareable: just a link.
- Mobile later means wrapping the web app (for example with Capacitor), not a rewrite. Touch targets and layout should stay phone-friendly.
- No server means no accounts or cloud saves until the game has players who need them.
- Rich animation is harder than in Unity or Godot. Accepted, since the game is mainly UI.
