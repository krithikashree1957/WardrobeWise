import { describe, expect, it } from 'vitest';
import { suggestScheme } from '../src/services/colorTheoryService';

describe('suggestScheme', () => {
  it('returns monochromatic for colors with hue difference below 20 degrees', () => {
    expect(suggestScheme('#FF0000', '#FF1A00')).toBe('monochromatic');
  });

  it('returns analogous for colors with hue difference between 20 and 59 degrees', () => {
    expect(suggestScheme('#FF0000', '#FF8000')).toBe('analogous');
  });

  it('returns split-complementary for colors with hue difference between 60 and 149 degrees', () => {
    expect(suggestScheme('#FF0000', '#00FF00')).toBe('split-complementary');
  });

  it('returns complementary for colors with hue difference between 150 and 199 degrees', () => {
    expect(suggestScheme('#FF0000', '#0080FF')).toBe('complementary');
  });

  it('documents the triadic branch as unreachable for valid normalized hues', () => {
    expect(suggestScheme('#FF0000', '#0000FF')).toBe('split-complementary');
  });

  it('uses the shortest hue distance when colors cross the 360-degree boundary', () => {
    expect(suggestScheme('#FF0000', '#FF002B')).toBe('monochromatic');
  });
});