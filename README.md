# The Colour of Excess

A Next.js static website analysing The Wolf of Wall Street (2013).

## Run

- npm install
- npm run dev
- npm run build produces the deployable out directory.

## Content

- app/content.ts: fourteen scene readings and the character arc.
- app/measurements.json: reproducible screenshot measurements and original file names.
- app/page.tsx: interactions, placeholder video, QR target and export controls.
- app/export-pdf.ts: exports snapshots of the rendered website sections.
- app/globals.css: responsive layout, animation, and browser print fallback.
- public/the-colour-of-excess.pdf: reviewed website snapshot.

The hero uses local animated stills with proportional cover cropping as explicitly labelled placeholders. The lower video embeds the supplied Jordan Belfort YouTube video after the viewer presses play. Replace MotionVideo with real video sources when clips are available. All scene images are distinct selections from the supplied screenshots; modal views naturally reuse the selected image.

## PDF regeneration

Use Export PDF in the header or footer. The export captures the current website width and selected hero image, embeds its fonts, and preserves the website layout on section-sized pages. Video is frozen to its poster; pop-up readings are excluded. The long gallery remains a continuous page to preserve its spacing. After content changes, review the generated PDF and copy it to public/the-colour-of-excess.pdf to refresh the archived download.

The QR currently targets the Sites URL in app/page.tsx. Public classroom access depends on that site's sharing settings.

The reference's typography, paper/brown/orange palette, opening tile expansion, sliding hero, thumbnail selectors, inline image reveals, asymmetric gallery and cursor interactions are implemented in React/GSAP. Film analysis and colour tools supply the assignment-specific content.
