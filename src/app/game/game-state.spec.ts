import { TestBed } from '@angular/core/testing';
import { GameState, STANDARD_BOX_PRICE } from './game-state';
import { Part } from './parts';

function part(id: number, type: Part['type'], overrides: Partial<Part> = {}): Part {
  return { id, type, rarity: 'Common', mainRoll: 0.5, weightRoll: 0.5, ...overrides };
}

describe('GameState', () => {
  let game: GameState;

  beforeEach(() => {
    localStorage.clear();
    game = TestBed.inject(GameState);
  });

  it('starts with a Default Ship that can make Trips', () => {
    const ship = game.ship();
    expect(ship.hull?.size).toBe('Small');
    expect(ship.tools.length).toBe(1);
    expect(game.canMakeTrips()).toBe(true);
  });

  it('swaps a fitted Part back into inventory', () => {
    const oldEngine = game.ship().engine!;
    const newEngine = part(100, 'Engine', { rarity: 'Uncommon' });
    game.inventory.set([newEngine]);

    game.fit(newEngine);

    expect(game.ship().engine).toBe(newEngine);
    expect(game.inventory()).toEqual([oldEngine]);
  });

  it('returns extra Tools to inventory when a smaller Hull is fitted', () => {
    const lasers = [part(101, 'MiningLaser'), part(102, 'MiningLaser'), part(103, 'MiningLaser')];
    game.ship.update((s) => ({ ...s, hull: part(100, 'Hull', { size: 'Medium' }), tools: lasers }));
    const smallHull = part(104, 'Hull', { size: 'Small' });
    game.inventory.set([smallHull]);

    game.fit(smallHull);

    expect(game.ship().tools).toEqual([lasers[0]]);
    expect(game.inventory().map((p) => p.id).sort()).toEqual([100, 102, 103]);
  });

  it('removes the Tools along with the Hull, which stops Trips', () => {
    game.remove(game.ship().hull!);

    expect(game.ship().tools).toEqual([]);
    expect(game.inventory().length).toBe(2);
    expect(game.canMakeTrips()).toBe(false);
  });

  it('only opens a Loot Box when the player can afford it', () => {
    game.buyStandardBox();
    expect(game.inventory().length).toBe(0);

    game.credits.set(STANDARD_BOX_PRICE);
    game.buyStandardBox();
    expect(game.credits()).toBe(0);
    expect(game.inventory().length).toBe(1);
  });

  it('fuses 3 inventory Parts into one of the next Rarity', () => {
    game.inventory.set([part(100, 'Reactor'), part(101, 'Reactor'), part(102, 'Reactor')]);

    game.fuse([100, 101, 102]);

    expect(game.inventory().length).toBe(1);
    expect(game.inventory()[0].rarity).toBe('Uncommon');
  });
});
