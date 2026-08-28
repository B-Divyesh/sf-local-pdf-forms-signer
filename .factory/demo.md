# Field Desk demo

Open `/demo` or `/?demo=1` for the one-click sample.

The sample is a two-page Harbor Street Studio client intake. It includes completed standard fields, a checked approval box, a typed visual signature, and a second page for page controls.

Demo state exists only in the running tab. The only demo storage key is `demo:field-desk-session`; it marks the isolated sample session and contains no document or edits. **Reset demo** clears that key, discards the in-memory PDF and builds a new sample. **Start for real** clears the demo key and discards the sample before returning home. Real document data is never read or written in demo mode.
