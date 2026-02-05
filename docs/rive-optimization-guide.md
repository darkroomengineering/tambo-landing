# Rive File Optimization Guide

This guide covers optimizations for the Tambo landing page .riv files **without modifying animations**.

## Current State

| File | Size | Issues |
|------|------|--------|
| `hero_loop_1.riv` | 537 KB | 3 PNGs, 1 full font |
| `Mobile_hero_loop_1.riv` | 537 KB | 3 PNGs, 1 full font |
| `moment-1_loop_1.riv` | 779 KB | 2 PNGs, 1 full font |
| `mobile_moment-1_loop_1.riv` | 779 KB | 2 PNGs, 1 full font |
| **Total** | **2.6 MB** | |

**Target:** ~500 KB - 1 MB total (60-80% reduction)

---

## Step 1: Font Subsetting (30-50% savings)

The Sentient-Light font is embedded with thousands of unused glyphs.

### In Rive Editor:

1. Open the .riv file
2. Go to **Assets Panel** (left sidebar)
3. Click on the **Sentient-Light** font
4. In the Inspector, find **"Glyphs"** or **"Character Set"**
5. Click **"Select Glyphs"** or **"Subset"**
6. Choose **only the characters used in your animation**:
   - If using letters A-Z, a-z, numbers 0-9, select only those
   - Add any special characters actually displayed (!, ?, etc.)
   - **Remove**: Greek, Cyrillic, ligatures (f_f, f_b), old-style figures, math symbols
7. Apply the subset

### Characters to REMOVE (unless used):

```
- Ligatures: f_b, f_f, f_f_b, f_f_h, f_f_i, f_f_j, f_f_k, f_f_l, f_h, f_j, f_k, f_t
- Extended Latin: Ă, Ā, Ą, Ć, Č, Ċ, Ď, Đ, Ě, Ė, Ē, Ę, Ẽ, Ğ, Ģ, Ġ, Ħ, İ, Ī, Į, Ĩ, Ķ, Ĺ, Ľ, Ļ, Ń, Ň, Ņ, Ŋ, Ő, Ō, Ŕ, Ř, Ŗ, Ś, Ş, Ș, Ŧ, Ť, Ţ, Ț, Ű, Ū, Ų, Ů, Ũ, Ẃ, Ŵ, Ẅ, Ẁ, Ŷ, Ỳ, Ỹ, Ź, Ż
- Old-style figures: ⁰¹²³⁴⁵⁶⁷⁸⁹ (osf variants)
- Superior/cap variants
- Currency: ₺, ₽, ₹, ₿
- Math: ≠, ≥, ≤, ≈, ∅, ∞, ∫, ∆, ∏, ∑, √, ∂
```

---

## Step 2: Image Compression (30-50% savings)

### Convert to WebP:

1. In **Assets Panel**, right-click each image
2. Select **"Compress"** or **"Convert"**
3. Choose **WebP** format
4. Set quality to **75%** (Rive's recommended default)
5. Apply to all embedded images

### Resize if oversized:

1. Check the actual display size in your animation
2. If an image is 2000x2000px but displays at 500x500px, resize it
3. **Rule**: Image dimensions should match max display size

### Images to compress:

- `hero_loop_1.riv`: 3 PNG images
- `moment-1_loop_1.riv`: 2 PNG images (including "Container Pattern Pink")

---

## Step 3: Referenced Assets (50-80% savings) - Optional

This is the most impactful optimization but requires code changes.

### In Rive Editor:

1. Select an image or font in **Assets Panel**
2. In the Inspector, find **"Export Type"**
3. Change from **"Embedded"** to **"Referenced"**
4. Export the asset separately (File > Export Asset)
5. Repeat for all large assets

### Required Code Changes:

If you use referenced assets, update `components/rive/index.tsx`:

```tsx
import { useRive } from '@rive-app/react-webgl2'

// Add asset loader
const { rive, RiveComponent } = useRive({
  src: riveSrc,
  stateMachines: stateMachine,
  autoplay: false,
  assetLoader: (asset, bytes) => {
    // Load fonts
    if (asset.isFont) {
      fetch('/assets/fonts/sentient-light.woff2')
        .then((res) => res.arrayBuffer())
        .then((buffer) => asset.decode(new Uint8Array(buffer)))
      return true
    }
    // Load images
    if (asset.isImage) {
      fetch(`/assets/rives/images/${asset.name}`)
        .then((res) => res.arrayBuffer())
        .then((buffer) => asset.decode(new Uint8Array(buffer)))
      return true
    }
    return false
  },
})
```

**Benefit**: Assets can be cached independently and shared across files.

---

## Step 4: Cleanup (5-15% savings)

### Delete unused elements:

1. **Artboards**: Delete any artboards not used in the final animation
2. **Assets**: Remove any images/fonts in Assets Panel not used
3. **SVGs**: Delete any SVG files from Assets Panel (they bloat exports)
4. **Timelines**: Remove empty or unused timelines

### Check for:

- Duplicate keyframes at the same position
- Hidden layers with complex content
- Unused state machines

---

## Export Checklist

Before exporting each .riv file:

- [ ] Font subsetted to only used characters
- [ ] All images converted to WebP 75%
- [ ] Images resized to max display dimensions
- [ ] Unused artboards deleted
- [ ] Unused assets removed from Assets Panel
- [ ] No SVGs in Assets Panel

---

## Verification

After optimization, file sizes should be approximately:

| File | Before | Target |
|------|--------|--------|
| `hero_loop_1.riv` | 537 KB | ~150-200 KB |
| `Mobile_hero_loop_1.riv` | 537 KB | ~150-200 KB |
| `moment-1_loop_1.riv` | 779 KB | ~200-300 KB |
| `mobile_moment-1_loop_1.riv` | 779 KB | ~200-300 KB |
| **Total** | **2.6 MB** | **~600 KB - 1 MB** |

---

## Resources

- [Rive Best Practices](https://rive.app/docs/getting-started/best-practices)
- [Optimizing Rive Files Guide](https://rive.app/blog/a-designer-s-guide-to-optimizing-files-and-workflows)
- [Loading Assets Documentation](https://help.rive.app/runtimes/loading-assets)
