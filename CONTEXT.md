# MyShips

A semi-idle space game. The player clicks to earn, then collects parts to build ships that keep earning without them.

## Language

### Economy

**Credits**:
The single universal currency. Everything that earns produces Credits.
_Avoid_: Money, cash, gold, coins

**Asteroid**:
The object the player clicks by hand to earn Credits. It is the game's first earning source. Each click earns a small fixed amount, plus a share of the player's Credits per second once they buy Click Upgrades.
_Avoid_: Rock, node, cookie

**Click Upgrade**:
A purchase with Credits that adds a share of the player's Credits per second to every Asteroid click. Click Upgrades come in a series, each adding to the share, and later ones unlock over time.
_Avoid_: Mouse upgrade, click power

### Roles

**Role**:
One of the five income paths a ship can follow: Mining, Trade, Combat, Salvage, or Exploration. The player starts with Mining unlocked and buys the others with Credits. All Roles have roughly the same base payout. Each Role depends most on one stat, so which Role earns best depends on the Parts the player owns.
_Avoid_: Path, job, class, building

**Role Unlock**:
Buying a locked Role with Credits. Every locked Role can be bought at any time, in any order the player chooses. All locked Roles share one price, and each Role Unlock raises that price for the rest (for example, doubling it). A Role Unlock checks each Part a Ship needs: Hull, Engine, Reactor, and a Tool for that Role. For each one the player has no spare of, it gives a Common one. For each one they do have, it gives nothing.
_Avoid_: Role purchase, tech tree

**Mining**:
The Role of earning Credits from Asteroids. Depends most on its Tools.
_Avoid_: Harvesting, drilling

**Trade**:
A Role. Depends most on Hull Size.

**Combat**:
A Role. Depends most on Hull toughness (Hull Rarity).

**Salvage**:
A Role. Depends most on the Reactor.

**Exploration**:
A Role. Depends most on the Engine.

**Garage**:
The home of one Role's ships. There is one Garage per Role, and unlocking a Role unlocks its Garage. The game starts with only the Mining Garage.
_Avoid_: Hangar, dock, fleet

**Ship Slot**:
A place for one ship inside a Garage. Each Garage holds 1 to 5 Ship Slots, and extra ones are bought with Credits. Each Garage prices its own Ship Slots, and each one costs much more than the last. A new Ship Slot comes empty. The player builds its Ship from Parts they already own.
_Avoid_: Bay, berth

**Ship**:
A vessel built for one Role, which its Garage decides. A Ship never changes Role.
_Avoid_: Vessel, unit, craft

**Trip**:
One short earning cycle of a Ship. It flies out, does its Role's work, and returns with Credits. Trips last only a few seconds and always succeed. Nothing is ever lost on a Trip. A Ship missing its Hull, Engine, Reactor, or every Tool makes no Trips.
_Avoid_: Run, mission, cycle, voyage

**Default Ship**:
The Ship the player owns at the start of the game, in the first Mining Ship Slot. It has a Small Hull and Common Parts.
_Avoid_: Starter ship

**Offline Earnings**:
The Credits Ships earn while the game is closed. They pile up for at most 12 hours, at the full rate. Later versions may start lower and let the limit grow toward 24 hours as the player progresses.
_Avoid_: Idle income, AFK gains

### Parts

**Part**:
A component that goes into a Ship. Every Part is either a General Component or a Tool, and has a Rarity. A higher Rarity improves a Part of any kind. Fitting a Part to a Ship uses it up, so one Part can only be on one Ship at a time. Parts can be taken off and moved between Ships freely, at no cost, and they keep their Stat Rolls. Only Parts in inventory can be used in Fusion. No two Parts are exactly alike, because each one has its own Stat Rolls.
_Avoid_: Item, module, equipment

**General Component**:
A Part that any Ship can use, whatever its Role. The three kinds are Hull, Engine, and Reactor, and every Ship has one of each.
_Avoid_: Generic part, common part (Common is a Rarity)

**Hull**:
The General Component that forms a Ship's body. Its main stat is Toughness. Its Hull Size sets how heavy it is, and its Rarity makes it lighter and tougher.
_Avoid_: Frame, chassis, body

**Hull Size**:
How large a Hull is: Small, Medium, or Large. Hull Size alone decides how many Tool Slots a Ship has: 1, 3, or 5. Larger Hulls drop less often, and Size and Rarity roll separately. Larger Hulls hold more Tools but weigh more. Fusion never changes Hull Size.
_Avoid_: Class, tonnage

**Engine**:
The General Component that moves a Ship. Its main stat is Thrust.
_Avoid_: Thruster, drive

**Reactor**:
The General Component that powers a Ship. Its main stat is Power.
_Avoid_: Core, generator, power plant

**Tool**:
A Part tied to one Role, such as a Mining Laser for Mining or a weapon for Combat. A Ship can only use Tools that match its Role. Its main stat is Yield.
_Avoid_: Role Part, role tool, specialized part

**Tool Slot**:
A place on a Ship's Hull for one Tool.
_Avoid_: Hardpoint, mount

**Stat Roll**:
A random value a Part gets for one of its stats when it drops, within a range set by its kind and Rarity. Two Common Engines may differ slightly in Thrust. High rolls are much rarer than low ones. Most players can ignore Stat Rolls; dedicated players can hunt for the best ones.
_Avoid_: IVs, variance, quality, affix

**Part Type**:
What kind of Part something is, ignoring its Stat Rolls and Rarity: Hull, Engine, Reactor, or the Tool for a particular Role. Two Common Reactors with different Stat Rolls are the same Part Type.
_Avoid_: Item type, model, kind

**Rarity**:
A Part's quality tier, from lowest to highest: Common, Uncommon, Rare, Epic, Legendary.
_Avoid_: Tier, grade, quality

**Legendary Effect**:
A special bonus that only Legendary Parts have. When a Part becomes Legendary, whether from a Loot Box or from Fusion, it gets one Legendary Effect picked at random from a pool for its Part Type. The Effect never changes after that. _(Planned for a later version. The pool is not yet defined.)_
_Avoid_: Perk, trait, affix, special

**Loot Box**:
A container bought with Credits that holds random Parts. It can drop any Part. Tools for Roles the player has not unlocked are rare. Loot Boxes come in three kinds: Standard, Advanced, and Elite. Each has a fixed price, and pricier kinds have better odds of high Rarity. Advanced and Elite Boxes unlock as the player's earnings grow. The Pity Guarantee counts all kinds together.
_Avoid_: Crate, chest, pack

**Fusion**:
Combining three Parts of the same Part Type and Rarity (and, for Hulls, the same Hull Size) into one Part of that type at the next Rarity up. Their Stat Rolls do not need to match. The new Part gets fresh Stat Rolls. For each stat, the best of the three inputs sets a floor: the input's position within its own range (say, 80% of the way up) carries over, and the new roll lands somewhere between that position and the top of the new range.
_Avoid_: Upgrade, merge, combine, crafting

**Scrap**:
Destroying an unwanted Part from inventory for a small number of Credits. Higher Rarity Parts give more. Inventory has no size limit.
_Avoid_: Sell, salvage (Salvage is a Role), dismantle, recycle

**Pity Guarantee**:
A safety rule that protects against bad luck at each Rarity above Common. Each of those Rarities has its own count of Loot Boxes opened since one last dropped, and its own limit. Reaching the limit guarantees a Part of that Rarity. The count resets whenever that Rarity or a higher one drops.
_Avoid_: Pity timer, bad-luck protection

### Stats

Every Part has one main stat for its job, plus Weight.

**Toughness**:
The Hull's main stat. It raises how much a Ship earns per Trip. Combat depends on it most.
_Avoid_: Armor, durability, HP

**Thrust**:
The Engine's main stat. More Thrust against the Ship's total Weight makes Trips shorter.
_Avoid_: Speed, propulsion

**Power**:
The Reactor's main stat. It multiplies how much a Ship earns per Trip. Salvage depends on it most.
_Avoid_: Energy, output

**Yield**:
A Tool's main stat. It sets the base amount a Ship earns per Trip.
_Avoid_: Damage, efficiency, production

**Weight**:
A stat every Part has. A Ship's total Weight slows down every Trip, so lower is better.
_Avoid_: Mass, load
