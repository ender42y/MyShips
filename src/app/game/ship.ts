import { Part, mainStat, weight } from './parts';

/** Tools has one entry per Tool Slot on the Hull; empty slots are null. */
export interface Ship {
  hull: Part | null;
  engine: Part | null;
  reactor: Part | null;
  tools: (Part | null)[];
}

// Placeholder balance number: tuned so a Common Ship with a Small Hull takes roughly 1 to 5 seconds per Trip.
const TRIP_SECONDS_PER_WEIGHT_PER_THRUST = 0.5;

function fittedParts(ship: Ship): Part[] {
  return [ship.hull, ship.engine, ship.reactor, ...ship.tools].filter((p): p is Part => p !== null);
}

/** A Ship makes Trips only with a Hull, Engine, Reactor and at least one Tool. */
export function canMakeTrips(ship: Ship): boolean {
  return ship.hull !== null && ship.engine !== null && ship.reactor !== null && ship.tools.some((t) => t !== null);
}

export function tripSeconds(ship: Ship): number {
  const totalWeight = fittedParts(ship).reduce((sum, part) => sum + weight(part), 0);
  return (TRIP_SECONDS_PER_WEIGHT_PER_THRUST * totalWeight) / mainStat(ship.engine!);
}

/** Tool Yield sets the base; Hull Toughness and Reactor Power each add a percentage on top. */
export function tripPayout(ship: Ship): number {
  const totalYield = ship.tools.reduce((sum, tool) => sum + (tool ? mainStat(tool) : 0), 0);
  const toughnessBonus = 1 + mainStat(ship.hull!) / 100;
  const powerBonus = 1 + mainStat(ship.reactor!) / 100;
  return totalYield * toughnessBonus * powerBonus;
}
