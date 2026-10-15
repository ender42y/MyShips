import { Part, mainStat, weight } from './parts';
import { Ship, canMakeTrips, tripPayout, tripSeconds } from './ship';

function part(id: number, type: Part['type'], overrides: Partial<Part> = {}): Part {
  return { id, type, rarity: 'Common', mainRoll: 0.5, weightRoll: 0.5, ...overrides };
}

function fullShip(): Ship {
  return {
    hull: part(1, 'Hull', { size: 'Medium' }),
    engine: part(2, 'Engine'),
    reactor: part(3, 'Reactor'),
    tools: [part(4, 'MiningLaser'), null, null],
  };
}

describe('Ship', () => {
  it('needs a Hull, Engine, Reactor and at least one Tool to make Trips', () => {
    expect(canMakeTrips(fullShip())).toBe(true);
    expect(canMakeTrips({ ...fullShip(), engine: null })).toBe(false);
    expect(canMakeTrips({ ...fullShip(), tools: [null, null, null] })).toBe(false);
  });

  it('makes heavier Ships slower and more Thrust faster', () => {
    const ship = fullShip();
    const heavier = { ...ship, tools: [ship.tools[0], part(5, 'MiningLaser'), null] };
    const stronger = { ...ship, engine: part(2, 'Engine', { rarity: 'Rare' }) };
    expect(tripSeconds(heavier)).toBeGreaterThan(tripSeconds(ship));
    expect(tripSeconds(stronger)).toBeLessThan(tripSeconds(ship));
  });

  it('keeps a Common Ship in the 1 to 5 second Trip range', () => {
    const seconds = tripSeconds(fullShip());
    expect(seconds).toBeGreaterThanOrEqual(1);
    expect(seconds).toBeLessThanOrEqual(5);
  });

  it('counts the Weight of every fitted Part against Engine Thrust', () => {
    const ship = fullShip();
    const totalWeight = [ship.hull!, ship.engine!, ship.reactor!, ship.tools[0]!].reduce((sum, p) => sum + weight(p), 0);
    expect(tripSeconds(ship)).toBeCloseTo((0.5 * totalWeight) / mainStat(ship.engine!));
  });

  it('pays Tool Yield, raised by Hull Toughness and Reactor Power', () => {
    const ship = fullShip();
    const expected = mainStat(ship.tools[0]!) * (1 + mainStat(ship.hull!) / 100) * (1 + mainStat(ship.reactor!) / 100);
    expect(tripPayout(ship)).toBeCloseTo(expected);
  });
});
