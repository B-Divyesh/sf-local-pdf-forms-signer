# Field Desk demo

Open `/demo` or `/?demo=1` for the one-click sample.

The sample is a two-page Harbor Street Studio client intake. It includes completed standard fields, a checked approval box, a visual signature, and a landscape notes page for page controls.

Demo state exists only in memory in the running tab. It does not use localStorage, sessionStorage, IndexedDB, or cookies. **Reset demo** discards the in-memory PDF and builds a new sample. **Start for real**, legal navigation, and browser history all discard the sample before leaving demo mode. Entering demo mode also discards any real PDF already open, so the demo banner can never cover real data.

After the first online visit finishes caching, `/demo` and `/?demo=1` reopen offline. The cache contains only the public app shell, bundled PDF libraries, worker, and artwork. It never contains a PDF opened by the visitor.
