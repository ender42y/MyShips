const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] as const;
export type Rarity = (typeof RARITIES)[number];

export type HullSize = 'Small' | 'Medium' | 'Large';

export type PartType = 'Hull' | 'Engine' | 'Reactor' | 'MiningLaser';
export const PART_TYPES: PartType[] = ['Hull', 'Engine', 'Reactor', 'MiningLaser'];

export const TOOL_SLOTS: Record<HullSize, number> = { Small: 1, Medium: 3, Large: 5 };

/**
 * A Part's Stat Rolls are stored as positions within their range, from 0 (worst) to 1 (best),
 * so the real values can be rebalanced without touching saves.
 */
export interface Part {
  id: number;
  type: PartType;
  rarity: Rarity;
  /** Only Hulls have a size. */
  size?: HullSize;
  mainRoll: number;
  weightRoll: number;
}

// Placeholder balance numbers, as [worst, best] at Common Rarity.
const MAIN_STAT_RANGE: Record<PartType, [number, number]> = {
  Hull: [10, 20], // Toughness
  Engine: [10, 20], // Thrust
  Reactor: [10, 20], // Power
  MiningLaser: [1, 2], // Yield
};
const WEIGHT_RANGE: Record<Exclude<PartType, 'Hull'>, [number, number]> = {
  Engine: [15, 10],
  Reactor: [15, 10],
  MiningLaser: [6, 4],
};
const HULL_WEIGHT_RANGE: Record<HullSize, [number, number]> = {
  Small: [30, 20],
  Medium: [60, 40],
  Large: [105, 70],
};
// Each step up in Rarity doubles the main stat and makes the Part 20% lighter.
const MAIN_STAT_GROWTH = 2;
const WEIGHT_GROWTH = 0.8;

function rarityIndex(rarity: Rarity): number {
  return RARITIES.indexOf(rarity);
}

export function mainStat(part: Part): number {
  const [worst, best] = MAIN_STAT_RANGE[part.type];
  return lerp(worst, best, part.mainRoll) * MAIN_STAT_GROWTH ** rarityIndex(part.rarity);
}

export function weight(part: Part): number {
  const [worst, best] = part.type === 'Hull' ? HULL_WEIGHT_RANGE[part.size!] : WEIGHT_RANGE[part.type];
  return lerp(worst, best, part.weightRoll) * WEIGHT_GROWTH ** rarityIndex(part.rarity);
}

/**
 * Rolls a position from `floor` to 1. Squaring the random number makes low rolls
 * much more likely than high ones, so a great roll is rare.
 */
export function rollStat(random: () => number, floor = 0): number {
  return floor + (1 - floor) * random() ** 2;
}

export function createPart(
  id: number,
  type: PartType,
  rarity: Rarity,
  size: HullSize | undefined,
  random: () => number,
): Part {
  return { id, type, rarity, size, mainRoll: rollStat(random), weightRoll: rollStat(random) };
}

/** Fusion needs 3 different Parts of the same Part Type, Rarity and (for Hulls) size, below Legendary. */
export function canFuse(parts: Part[]): boolean {
  if (parts.length !== 3 || new Set(parts.map((p) => p.id)).size !== 3) return false;
  const [first] = parts;
  return (
    first.rarity !== 'Legendary' &&
    parts.every((p) => p.type === first.type && p.rarity === first.rarity && p.size === first.size)
  );
}

/** The best roll of each stat among the inputs becomes the floor for the new roll. */
export function fuse(parts: Part[], id: number, random: () => number): Part {
  if (!canFuse(parts)) throw new Error('These Parts cannot be fused.');
  const [first] = parts;
  return {
    id,
    type: first.type,
    rarity: RARITIES[rarityIndex(first.rarity) + 1],
    size: first.size,
    mainRoll: rollStat(random, Math.max(...parts.map((p) => p.mainRoll))),
    weightRoll: rollStat(random, Math.max(...parts.map((p) => p.weightRoll))),
  };
}

function lerp(from: number, to: number, position: number): number {
  return from + (to - from) * position;
}
