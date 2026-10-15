import { Part, canFuse, fuse, mainStat, rollStat, weight } from './parts';

function part(overrides: Partial<Part> = {}): Part {
  return { id: 1, type: 'Engine', rarity: 'Common', mainRoll: 0.5, weightRoll: 0.5, ...overrides };
}

describe('rollStat', () => {
  it('leans toward low rolls', () => {
    expect(rollStat(() => 0.5)).toBe(0.25);
  });

  it('never rolls below the floor', () => {
    expect(rollStat(() => 0, 0.8)).toBe(0.8);
    expect(rollStat(() => 0.5, 0.8)).toBeCloseTo(0.85);
    expect(rollStat(() => 1, 0.8)).toBe(1);
  });
});

describe('stats', () => {
  it('doubles the main stat with each Rarity', () => {
    expect(mainStat(part({ rarity: 'Uncommon' }))).toBe(mainStat(part()) * 2);
  });

  it('treats a high weight roll as lighter', () => {
    expect(weight(part({ weightRoll: 1 }))).toBeLessThan(weight(part({ weightRoll: 0 })));
  });

  it('makes larger Hulls heavier', () => {
    const small = part({ type: 'Hull', size: 'Small' });
    const large = part({ type: 'Hull', size: 'Large' });
    expect(weight(large)).toBeGreaterThan(weight(small));
  });
});

describe('Fusion', () => {
  const trio = [part({ id: 1 }), part({ id: 2 }), part({ id: 3 })];

  it('accepts 3 Parts of the same type and Rarity with different rolls', () => {
    expect(canFuse([part({ id: 1, mainRoll: 0.1 }), part({ id: 2, mainRoll: 0.9 }), part({ id: 3 })])).toBe(true);
  });

  it('rejects the wrong count, repeated Parts, mixed types, mixed Rarities and Legendaries', () => {
    expect(canFuse(trio.slice(0, 2))).toBe(false);
    expect(canFuse([trio[0], trio[0], trio[1]])).toBe(false);
    expect(canFuse([...trio.slice(0, 2), part({ id: 3, type: 'Reactor' })])).toBe(false);
    expect(canFuse([...trio.slice(0, 2), part({ id: 3, rarity: 'Uncommon' })])).toBe(false);
    expect(canFuse(trio.map((p) => ({ ...p, rarity: 'Legendary' as const })))).toBe(false);
  });

  it('rejects Hulls of different sizes', () => {
    const hulls = trio.map((p) => ({ ...p, type: 'Hull' as const, size: 'Small' as const }));
    expect(canFuse(hulls)).toBe(true);
    expect(canFuse([...hulls.slice(0, 2), { ...hulls[2], size: 'Medium' as const }])).toBe(false);
  });

  it('produces the next Rarity with the best input roll of each stat as the floor', () => {
    const inputs = [
      part({ id: 1, mainRoll: 0.9, weightRoll: 0.1 }),
      part({ id: 2, mainRoll: 0.2, weightRoll: 0.6 }),
      part({ id: 3, mainRoll: 0.3, weightRoll: 0.3 }),
    ];
    const result = fuse(inputs, 10, () => 0);
    expect(result).toEqual({ id: 10, type: 'Engine', rarity: 'Uncommon', size: undefined, mainRoll: 0.9, weightRoll: 0.6 });
  });

  it('throws when the Parts cannot be fused', () => {
    expect(() => fuse(trio.slice(0, 2), 10, () => 0)).toThrow();
  });
});
