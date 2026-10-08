# TannSpoof

TannSpoof is a static, installable PWA. It uses browser storage only and has no Supabase, Node.js, or external database dependency.

## Run locally

Any static HTTP server works. Examples:

- VS Code Live Server
- GitHub Pages
- Vercel static hosting
- Netlify static hosting

Opening `index.html` directly also works for the core UI, but service-worker/offline installation needs HTTPS or localhost.

## What it does

1. Parse hundreds of Roblox Animation IDs.
2. Global spoof: replace every `Animation` instance in the current Studio data model with one target ID.
3. Mapping spoof: replace selected source IDs with different target IDs.
4. Source transformer: replace IDs in pasted Luau text.
5. Studio preview bridge: load an animation on a selected rig in Roblox Studio without starting the game.
6. Export/copy ready-to-run Luau Command Bar scripts.
7. Persist mappings locally with localStorage.

## Studio usage

Paste the generated Luau into Roblox Studio's Command Bar. For preview, select an R6/R15 rig or model containing a Humanoid/AnimationController first.

## Publishing limitation

TannSpoof does not bypass Roblox's cloud publishing, ownership, moderation, or permission systems. It can swap existing published animation IDs immediately. New animation content must be published through Roblox's supported workflow before it has a reusable online animation asset ID.

## Credit

credit by tannn
