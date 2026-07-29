# Audio provenance

## jungle-ambience.mp3

- **Track**: "Sounds from the Atlantic Rainforest"
- **Author**: tvilgiat, via freesound_community
- **Source**: https://pixabay.com/sound-effects/nature-sounds-from-the-atlantic-rainforest-23501/
- **License**: [Pixabay Content License](https://pixabay.com/service/license-summary/) — free for commercial and personal use, no attribution required.

Played site-wide as a looping, muted-by-default ambient background track (see `src/components/AmbientAudioProvider/AmbientAudioProvider.tsx`), toggled from the header (`src/components/TopNav/TopNav.tsx`).

The original download was a very quiet field recording (mean level ≈ ‑44 dB) — at this app's 40%-volume playback level it was effectively inaudible. Re-encoded with a cumulative 28 dB gain boost (`ffmpeg -af "volume=18dB"` then another `"volume=10dB"` pass) to bring it to a mean level of ≈ ‑16 dB / peak ≈ ‑3 dB — clearly audible at 40% app volume, with a few dB of headroom left before clipping.
