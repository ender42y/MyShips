import { Injectable, computed, signal } from '@angular/core';
import { HullSize, Part, PART_TYPES, Rarity, TOOL_SLOTS, canFuse, createPart, fuse } from './parts';
import { Ship, canMakeTrips, tripPayout, tripSeconds } from './ship';

const SAVE_KEY = 'myships-save';
const SAVE_VERSION = 1;
const AUTOSAVE_MS = 5000;
const OFFLINE_LIMIT_SECONDS = 12 * 60 * 60;

// Placeholder balance numbers.
const CREDITS_PER_CLICK = 1;
export const STANDARD_BOX_PRICE = 25;
const STANDARD_BOX_UNCOMMON_CHANCE = 0.15;
const LARGE_HULL_CHANCE = 0.05;
const MEDIUM_HULL_CHANCE = 0.25;

interface SaveData {
  version: number;
  savedAt: number;
  credits: number;
  nextPartId: number;
  inventory: Part[];
  ship: Ship;
  tripProgress: number;
}

/**
 * Holds the whole game and moves it forward by real elapsed time, so a throttled
 * background tab and a closed game earn the same way.
 */
@Injectable({ providedIn: 'root' })
export class GameState {
  readonly credits = signal(0);
  readonly inventory = signal<Part[]>([]);
  readonly ship = signal<Ship>({ hull: null, engine: null, reactor: null, tools: [] });
  /** Seconds the Ship has spent on its current Trip. */
  readonly tripProgress = signal(0);
  /** Credits earned while the game was closed, shown once on return. */
  readonly offlineEarnings = signal(0);
  /** The Part most recently gained from a Loot Box or Fusion. */
  readonly latestPart = signal<Part | null>(null);

  readonly canMakeTrips = computed(() => canMakeTrips(this.ship()));
  readonly tripSeconds = computed(() => (this.canMakeTrips() ? tripSeconds(this.ship()) : 0));
  readonly tripPayout = computed(() => (this.canMakeTrips() ? tripPayout(this.ship()) : 0));
  readonly creditsPerSecond = computed(() => (this.canMakeTrips() ? this.tripPayout() / this.tripSeconds() : 0));
  readonly hasEmptyToolSlot = computed(() => this.ship().tools.includes(null));

  private nextPartId = 1;
  private lastUpdate = Date.now();

  constructor() {
    const save = loadSave();
    if (save) {
      this.credits.set(save.credits);
      this.nextPartId = save.nextPartId;
      this.inventory.set(save.inventory);
      this.ship.set(save.ship);
      this.tripProgress.set(save.tripProgress ?? 0);
      this.lastUpdate = save.savedAt;
    } else {
      this.ship.set(this.createDefaultShip());
    }
  }

  /** Collects Offline Earnings, then keeps the game running and saving. */
  start(): void {
    const creditsBefore = this.credits();
    this.advanceTrips();
    this.offlineEarnings.set(this.credits() - creditsBefore);

    const onFrame = () => {
      this.advanceTrips();
      requestAnimationFrame(onFrame);
    };
    requestAnimationFrame(onFrame);
    setInterval(() => this.save(), AUTOSAVE_MS);
    addEventListener('pagehide', () => this.save());
  }

  clickAsteroid(): void {
    this.credits.update((c) => c + CREDITS_PER_CLICK);
  }

  buyStandardBox(): void {
    if (this.credits() < STANDARD_BOX_PRICE) return;
    this.credits.update((c) => c - STANDARD_BOX_PRICE);
    const part = this.rollStandardBoxPart();
    this.inventory.update((inv) => [...inv, part]);
    this.latestPart.set(part);
  }

  /** Moves a Part from inventory onto the Ship. Any Part it replaces goes back to inventory. */
  fit(part: Part): void {
    const ship = this.ship();
    let next: Ship;
    let replaced: (Part | null)[];

    switch (part.type) {
      case 'Hull': {
        // Keep as many fitted Tools as the new Hull has slots for; the rest go back to inventory.
        const slots = TOOL_SLOTS[part.size!];
        const tools = ship.tools.filter((t) => t !== null);
        next = { ...ship, hull: part, tools: [...tools.slice(0, slots), ...Array(Math.max(0, slots - tools.length)).fill(null)] };
        replaced = [ship.hull, ...tools.slice(slots)];
        break;
      }
      case 'Engine':
        next = { ...ship, engine: part };
        replaced = [ship.engine];
        break;
      case 'Reactor':
        next = { ...ship, reactor: part };
        replaced = [ship.reactor];
        break;
      case 'MiningLaser': {
        const emptySlot = ship.tools.indexOf(null);
        if (emptySlot < 0) return;
        next = { ...ship, tools: ship.tools.map((t, i) => (i === emptySlot ? part : t)) };
        replaced = [];
        break;
      }
    }

    this.ship.set(next);
    this.inventory.update((inv) => [...inv.filter((p) => p.id !== part.id), ...replaced.filter((p) => p !== null)]);
  }

  /** Takes a Part off the Ship. Removing the Hull also removes its Tools, since they sit on the Hull. */
  remove(part: Part): void {
    const ship = this.ship();
    let next: Ship;
    let removed: Part[] = [part];

    if (ship.hull?.id === part.id) {
      next = { ...ship, hull: null, tools: [] };
      removed = [part, ...ship.tools.filter((t) => t !== null)];
    } else if (ship.engine?.id === part.id) {
      next = { ...ship, engine: null };
    } else if (ship.reactor?.id === part.id) {
      next = { ...ship, reactor: null };
    } else {
      next = { ...ship, tools: ship.tools.map((t) => (t?.id === part.id ? null : t)) };
    }

    this.ship.set(next);
    this.inventory.update((inv) => [...inv, ...removed]);
  }

  canFuse(partIds: number[]): boolean {
    return canFuse(this.inventory().filter((p) => partIds.includes(p.id)));
  }

  fuse(partIds: number[]): void {
    const inputs = this.inventory().filter((p) => partIds.includes(p.id));
    const result = fuse(inputs, this.nextPartId++, Math.random);
    this.inventory.update((inv) => [...inv.filter((p) => !partIds.includes(p.id)), result]);
    this.latestPart.set(result);
  }

  dismissOfflineEarnings(): void {
    this.offlineEarnings.set(0);
  }

  /** Advances every Trip by the real time since the last update, up to the offline limit. */
  private advanceTrips(): void {
    const now = Date.now();
    const elapsedSeconds = Math.min((now - this.lastUpdate) / 1000, OFFLINE_LIMIT_SECONDS);
    this.lastUpdate = now;
    if (!this.canMakeTrips() || elapsedSeconds <= 0) return;

    // Count whole Trips at once, so a long gap costs no more than a short one.
    const progress = this.tripProgress() + elapsedSeconds;
    const trips = Math.floor(progress / this.tripSeconds());
    if (trips > 0) this.credits.update((c) => c + trips * this.tripPayout());
    this.tripProgress.set(progress - trips * this.tripSeconds());
  }

  private save(): void {
    const data: SaveData = {
      version: SAVE_VERSION,
      savedAt: this.lastUpdate,
      credits: this.credits(),
      nextPartId: this.nextPartId,
      inventory: this.inventory(),
      ship: this.ship(),
      tripProgress: this.tripProgress(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (err) {
      // Storage can be blocked or full; the game keeps running and retries on the next autosave.
      console.warn('Could not save the game.', err);
    }
  }

  private createDefaultShip(): Ship {
    return {
      hull: this.newPart('Hull', 'Common', 'Small'),
      engine: this.newPart('Engine', 'Common'),
      reactor: this.newPart('Reactor', 'Common'),
      tools: [this.newPart('MiningLaser', 'Common')],
    };
  }

  private rollStandardBoxPart(): Part {
    const rarity: Rarity = Math.random() < STANDARD_BOX_UNCOMMON_CHANCE ? 'Uncommon' : 'Common';
    const type = PART_TYPES[Math.floor(Math.random() * PART_TYPES.length)];
    if (type !== 'Hull') return this.newPart(type, rarity);

    const sizeRoll = Math.random();
    const size: HullSize =
      sizeRoll < LARGE_HULL_CHANCE ? 'Large' : sizeRoll < LARGE_HULL_CHANCE + MEDIUM_HULL_CHANCE ? 'Medium' : 'Small';
    return this.newPart(type, rarity, size);
  }

  private newPart(type: Part['type'], rarity: Rarity, size?: HullSize): Part {
    return createPart(this.nextPartId++, type, rarity, size, Math.random);
  }
}

function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data.version === SAVE_VERSION ? data : null;
  } catch (err) {
    console.warn('Could not load the saved game; starting fresh.', err);
    return null;
  }
}
