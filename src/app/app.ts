import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { GameState, STANDARD_BOX_PRICE } from './game/game-state';
import { Part, mainStat, weight } from './game/parts';

const PART_NAMES: Record<Part['type'], string> = {
  Hull: 'Hull',
  Engine: 'Engine',
  Reactor: 'Reactor',
  MiningLaser: 'Mining Laser',
};
const MAIN_STAT_NAMES: Record<Part['type'], string> = {
  Hull: 'Toughness',
  Engine: 'Thrust',
  Reactor: 'Power',
  MiningLaser: 'Yield',
};

@Component({
  selector: 'app-root',
  imports: [DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly game = inject(GameState);
  protected readonly boxPrice = STANDARD_BOX_PRICE;
  /** Inventory Parts the player has ticked for Fusion. */
  protected readonly selectedIds = signal<number[]>([]);
  protected readonly canFuseSelection = computed(() => this.game.canFuse(this.selectedIds()));
  protected readonly tripPercent = computed(() =>
    this.game.canMakeTrips() ? (this.game.tripProgress() / this.game.tripSeconds()) * 100 : 0,
  );

  ngOnInit(): void {
    this.game.start();
  }

  protected toggleSelected(part: Part): void {
    this.selectedIds.update((ids) => (ids.includes(part.id) ? ids.filter((id) => id !== part.id) : [...ids, part.id]));
  }

  protected fuseSelection(): void {
    this.game.fuse(this.selectedIds());
    this.selectedIds.set([]);
  }

  protected fit(part: Part): void {
    this.selectedIds.update((ids) => ids.filter((id) => id !== part.id));
    this.game.fit(part);
  }

  protected canFit(part: Part): boolean {
    return part.type !== 'MiningLaser' || this.game.hasEmptyToolSlot();
  }

  /** Explains why a Mining Laser can't be fitted right now. */
  protected fitBlockedReason(part: Part): string {
    if (this.canFit(part)) return '';
    return this.game.ship().hull ? 'Remove a Mining Laser first' : 'Fit a Hull first';
  }

  protected partName(part: Part): string {
    return `${part.rarity} ${part.size ? part.size + ' ' : ''}${PART_NAMES[part.type]}`;
  }

  protected partStats(part: Part): string {
    return `${MAIN_STAT_NAMES[part.type]} ${mainStat(part).toFixed(1)} · Weight ${weight(part).toFixed(1)}`;
  }
}
