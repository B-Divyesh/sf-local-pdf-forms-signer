# Field Desk — visual thesis

## Direction

**Mid-century instrument panel.** Field Desk should feel like a dependable piece of office equipment: a drafting table crossed with a 1960s measurement console. That metaphor fits a privacy-first PDF utility because it makes document operations feel physical, legible, and under the operator's control. It avoids both corporate SaaS gloss and fake “secure cloud” imagery.

The landing view resembles a clipped paper docket beside a compact control panel. The editor becomes the instrument: a dark top rail, labeled toggle-like tools, ivory work surface, ruled metadata, safety-orange primary controls, and restrained teal status lamps. Chrome recedes once a document is open.

## Palette

Single-mode, explicitly painted like vintage equipment; a second theme would weaken the physical-material metaphor.

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#f3eddc` | page background and document surround |
| Warm white | `#fffaf0` | elevated paper and controls |
| Charcoal | `#202a2a` | equipment housing and primary text |
| Deep ink | `#17201f` | high-contrast headers |
| Muted ink | `#5d625b` | secondary copy (passes 4.5:1 on paper) |
| Safety orange | `#b84427` | primary actions and field handles; darkened to pass AA with warm white |
| Orange dark | `#94361f` | hover/active and readable links |
| Signal teal | `#23756f` | local/offline-safe state and confirmations |
| Ochre | `#9b6917` | warnings |
| Fault red | `#a53232` | destructive action and errors |
| Hairline | `#b9b09c` | rules and mechanical outlines |

All functional distinctions also use text, shape, or iconography. Core text and control combinations meet WCAG AA contrast.

## Type

- Display and control labels: **Arial Narrow**, `Roboto Condensed` if locally available, then `Arial`, sans-serif. Uppercase is reserved for tiny instrument labels, never body copy.
- Reading and document copy: **Georgia**, `Times New Roman`, serif—quiet, familiar, and paper-like.
- No webfonts ship. The system stacks eliminate a font request and keep first load fast.
- Scale: 12 / 14 / 16 / 20 / 28 / clamp(40–68) px. Body is 17 px on the landing view and at least 16 px throughout the editor.

## Spacing and shape

- 4 px base; principal rhythm 8 / 12 / 16 / 24 / 32 / 48 / 72.
- Work controls have 44 px minimum targets and 8 px separation.
- Corners are mostly 2–8 px, like punched sheet metal and stationery—not pill-heavy software.
- Shadows are hard, short offsets that suggest stacked paper; no diffuse glass effects.

## Interaction grammar

- A teal lamp plus the words “Stays on this device” communicates the privacy state.
- Primary actions are orange slab buttons with a 2 px down/left pressed motion.
- Tool selection resembles a latched mechanical switch. The selected tool is always named in the inspector and announced to assistive technology.
- Page thumbnails are sortable with buttons and keyboard commands, not drag alone.
- Destructive page deletion is immediately reversible through an Undo action.
- On mobile, the page rail becomes a horizontal strip, inspector becomes a bottom sheet-like panel, and the canvas remains the dominant surface.

## Motion

Transitions last 160–220 ms and only clarify origin or state: panels settle upward, controls depress, the active field handle changes opacity. There is no ambient or looping animation. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are immediate.

## Asset plan and provenance

One original generated hero illustration shows a private paper workflow as a tactile instrument: a cream PDF sheet passing through a charcoal tabletop console, with orange field markers and a teal local-status lamp. It explains the combined form/sign/page job without pretending to show the live UI. The app's icons are hand-authored inline SVG using simple geometric strokes; they are functional, not decorative.

### Image prompt sheet

- Use case: `stylized-concept`
- Asset: wide landing-page hero illustration
- Subject: a single cream document sheet passing through a compact mid-century tabletop document console; visible blank form boxes, one check mark, page tabs, a fountain-pen nib, and a round teal “local” status lamp
- World/materials: 1960s industrial design, powder-coated charcoal steel, warm ivory paper, bakelite orange controls, subtle paper grain
- Light/lens: soft directional studio light, slightly elevated three-quarter orthographic view, crisp editorial product illustration
- Palette words: parchment, charcoal, safety orange, signal teal, muted brass
- Composition: object weighted toward center-right with breathable plain parchment negative space around it
- Negative list: no people, no hands, no brand marks, no logos, no legible text, no watermark, no laptop, no phone, no cloud symbols, no gradients, no glossy 3D SaaS aesthetic

Generated with the factory Azure image deployment (`factory-image`) on 2026-08-27. The generated output is original to this product. Prompt sidecar lives beside the source asset in `assets/src/`.

## Accessibility and responsive intent

The landing page has one `h1`; the editor uses status headings below it. Focus rings use a 3 px orange outline with a 3 px offset. At 390 px, secondary explanatory copy shortens, the large hero art is dropped after document load, and actions stack without hiding beneath safe areas. Zoom to 200% reflows rather than clipping.
