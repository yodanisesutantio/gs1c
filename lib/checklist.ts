export type ChecklistItem = {
  id: string;
  title: string;
  credit?: boolean;
  children?: ChecklistItem[];
  note?: string;
};

export type ChecklistCategory = {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
};

const items = (prefix: string, titles: string[], credit = true): ChecklistItem[] => titles.map((title, index) => ({ id: `${prefix}-${String(index + 1).padStart(3, "0")}`, title, credit }));
const numbered = (prefix: string, title: string, count: number, credit = false): ChecklistItem => ({
  id: prefix,
  title,
  credit: true,
  note: `Completion credit is awarded when all ${count} entries are complete.`,
  children: Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${String(index + 1).padStart(3, "0")}`, title: `${title.replace(/^Complete |^Collect |^Spray |^Take /, "")} ${String(index + 1).padStart(2, "0")}`, credit }))
});

const story = [
  "In The Beginning", "Big Smoke", "Sweet & Kendl", "Ryder", "Tagging Up Turf", "Cleaning The Hood", "Drive-Thru", "Nines And AK's", "Drive-By", "Sweet's Girl", "Cesar Vialpando", "OG Loc", "Running Dog", "Wrong Side Of The Tracks", "Just Business", "Home Invasion", "Catalyst", "Robbing Uncle Sam", "Life's A Beach", "Madd Dogg's Rhymes", "Management Issues", "House Party", "High Stakes, Low Rider", "Burning Desire", "Gray Imports", "Doberman", "Los Sepulcros", "Reuniting The Families", "The Green Sabre",
  "Badlands", "First Date", "Tanker Commander", "Body Harvest", "King In Exile", "First Base", "Local Liquor Store", "Gone Courting", "Against All Odds", "Made In Heaven", "Small Town Bank", "Wu Zi Mu", "Farewell My Love...", "Are You Going To San Fierro?",
  "Wear Flowers In Your Hair", "555 WE TIP", "Deconstruction", "Air Raid", "Supply Lines...", "New Model Army", "Photo Opportunity", "Jizzy (Intro)", "Jizzy", "T-Bone Mendez", "Mike Toreno", "Outrider", "Snail Trail", "Ice Cold Killa", "Pier 69", "Toreno's Last Flight", "Mountain Cloud Boys", "Ran Fa Li", "Lure", "Amphibious Assault", "The Da Nang Thang", "Yay Ka-Boom-Boom", "Zeroing In", "Test Drive", "Customs Fast Track", "Puncture Wounds",
  "Monster", "Highjack", "Interdiction", "Verdant Meadows", "N.O.E.", "Stowaway", "Black Project", "Green Goo",
  "Fender Ketchup", "Explosive Situation", "You've Had Your Chips", "Don Peyote", "Architectural Espionage", "Key To Her Heart", "Dam And Blast", "Cop Wheels", "Up, Up And Away!", "Intensive Care", "The Meat Business", "Fish In A Barrel", "Misappropriation", "Madd Dogg", "Freefall", "High Noon", "Saint Mark's Bistro", "Breaking The Bank At Caligula's", "A Home In The Hills",
  "Vertical Bird", "Home Coming", "Cut Throat Business", "Beatdown On B Dup", "Grove 4 Life", "Riot", "Los Desperados", "End Of The Line"
];

const safeHouses = [
  "Willowfield - $10,000", "Verdant Bluffs - $10,000", "Jefferson - $10,000", "Mulholland - $120,000", "Verona Beach - $10,000", "Santa Maria Beach - $30,000",
  "Palomino Creek - $35,000", "Blueberry - $10,000", "Dillimore - $40,000", "Angel Pine - $20,000", "Whetstone - $100,000",
  "Hashbury - $40,000", "Doherty - $20,000", "Queens - $50,000", "Chinatown - $20,000", "Paradiso - $20,000", "Calton Heights - $100,000",
  "El Quebradas - $20,000", "Tierra Robada - $20,000", "Fort Carson - $30,000",
  "Whitewood Estates - $30,000", "Prickle Pine - $50,000", "Redsands West - $30,000", "Pirates In Men's Pants - $6,000", "The Camel's Toe - $6,000", "Rockshore West - $20,000", "The Clown's Pocket - $6,000", "Old Venturas Strip - $6,000", "Creek - $10,000"
];

const nonCreditStory = new Set(["In The Beginning", "High Stakes, Low Rider", "Wu Zi Mu", "Farewell My Love...", "Air Raid", "Supply Lines...", "New Model Army", "Jizzy (Intro)"]);

const categories: ChecklistCategory[] = [
  { id: "story", title: "Story missions", description: "Story mission checklist; tracking-only entries are marked and do not add separate credit.", items: story.map((title, index) => ({ id: `story-${String(index + 1).padStart(3, "0")}`, title, credit: !nonCreditStory.has(title) })) },
  { id: "collectibles", title: "Collectibles", description: "Each collectible set awards one completion objective only when the entire set is complete.", items: [
    numbered("gang-tags", "Spray all 100 gang tags", 100),
    numbered("snapshots", "Take all 50 snapshots", 50),
    numbered("horseshoes", "Collect all 50 horseshoes", 50),
    numbered("oysters", "Collect all 50 oysters", 50)
  ] },
  { id: "submissions", title: "Vehicle sub-missions", items: items("submission", ["Complete 50 Taxi Driver fares (in total)", "Complete Vigilante level 12", "Complete Paramedic level 12", "Complete Firefighter level 12", "Complete Pimping level 10", "Complete Freight mission (2 levels)"]) },
  { id: "hidden", title: "Hidden challenges", description: "The Chiliad routes form one completion objective; BMX and NRG-500 are separate.", items: [
    { id: "bmx-challenge", title: "Win BMX Challenge" },
    { id: "chiliad", title: "Win all 3 Chiliad Challenge routes", credit: true, children: items("chiliad-route", ["Win Scotch Bonnet route", "Win Birdseye Winder route", "Win Cobra Run route"], false) },
    { id: "nrg500", title: "Win NRG-500 Challenge" }
  ] },
  { id: "stadium", title: "Stadium challenges", items: items("stadium", ["Win 8-Track (first place)", "Win Blood Bowl (score 60+ seconds)", "Win Dirt Track (first place)", "Win Kick Start (score 26 points)"]) },
  { id: "gym", title: "Gym fighting moves", items: items("gym", ["Win Los Santos Gym Moves", "Win San Fierro Gym Moves", "Win Las Venturas Gym Moves"]) },
  { id: "ammu-nation", title: "Ammu-Nation gun challenges", items: items("gun-challenge", ["Win Pistol Challenge", "Win Micro SMG Challenge", "Win Shotgun Challenge", "Win AK-47 Challenge"]) },
  { id: "schools", title: "Vehicle schools", description: "Pass every available test with at least Bronze. Individual tests are tracking steps; the school awards one objective.", items: [
    { id: "driving-school", title: "Pass all Driving School tests (Bronze or higher)", credit: true, children: items("driving-test", ["The 360", "The 180", "Whip And Terminate", "Pop And Control", "Burn And Lap", "Cone Coil", "The 90", "Wheelie Weave", "Spin And Go", "P.I.T. Maneuver", "Alley Oop", "City Slicking"].map((name) => `Pass '${name}' Driving School test`), false) },
    { id: "boat-school", title: "Pass all Boat School tests (Bronze or higher)", credit: true, children: items("boat-test", ["Basic Seamanship", "Plot A Course", "Fresh Slalom", "Flying Fish", "Land, Sea And Air"].map((name) => `Pass '${name}' Boat School test`), false) },
    { id: "flight-school", title: "Pass all Flight School tests (Bronze or higher)", credit: true, children: items("flight-test", ["Takeoff", "Land Plane", "Circle Airstrip", "Circle Airstrip And Land", "Helicopter Takeoff", "Land Helicopter", "Destroy Targets", "Loop-The-Loop", "Barrel Roll", "Parachute Onto Target"].map((name) => `Pass '${name}' Flight School test`), false) },
    { id: "bike-school", title: "Pass all Bike School tests (Bronze or higher)", credit: true, children: items("bike-test", ["The 360", "The 180", "The Wheelie", "Jump & Stop", "The Stoppie", "Jump & Stoppie"].map((name) => `Pass '${name}' Bike School test`), false) }
  ] },
  { id: "courier", title: "Courier missions", items: items("courier", ["Complete Roboi's Food Mart Courier level 4", "Complete Hippy Shopper Courier level 4", "Complete Burger Shot Courier level 4"]) },
  { id: "assets", title: "Asset missions", description: "Trucking and Quarry each award one objective when their full set is complete.", items: [
    { id: "trucking", title: "Complete all 8 Trucking missions", credit: true, children: items("trucking-mission", Array.from({ length: 8 }, (_, i) => `Complete Trucking mission ${i + 1}`), false) },
    { id: "valet", title: "Complete Valet Parking level 5" },
    { id: "quarry", title: "Complete all 7 Quarry missions", credit: true, children: items("quarry-mission", Array.from({ length: 7 }, (_, i) => `Complete Quarry mission ${i + 1}`), false) }
  ] },
  { id: "races", title: "Street races & checkpoint challenges", items: ["Lowrider Race", "Little Loop", "Backroad Wanderer", "City Circuit", "Vinewood", "Freeway", "Into The Country", "Badlands A", "Badlands B", "Dirtbike Danger", "Bandito Country", "Go-Go Karting", "San Fierro Fastlane", "San Fierro Hills", "Country Endurance", "SF To LV", "Dam Rider", "Desert Tricks", "LV Ringroad", "World War Ace", "Barnstorming", "Military Service", "Chopper Checkpoint", "Whirly-Bird Waypoint", "Heli Hell"].map((name, index) => ({ id: `race-${String(index + 1).padStart(3, "0")}`, title: `Win ${name}`, credit: !["Lowrider Race", "Badlands A", "Badlands B"].includes(name) })) },
  { id: "import-export", title: "Import / Export lists", description: "Each vehicle list awards one objective after all ten vehicles are delivered.", items: [
    { id: "export-list-1", title: "Complete Import / Export List 1", credit: true, children: items("export-1", ["Patriot", "Sanchez", "Stretch", "Feltzer", "Remington", "Buffalo", "Sentinel", "Infernus", "Camper", "Admiral"].map((name) => `Deliver ${name}`), false) },
    { id: "export-list-2", title: "Complete Import / Export List 2", credit: true, children: items("export-2", ["Slamvan", "Blista Compact", "Stafford", "Sabre", "FCR-900", "Cheetah", "Rancher", "Stallion", "Tanker", "Comet"].map((name) => `Deliver ${name}`), false) },
    { id: "export-list-3", title: "Complete Import / Export List 3", credit: true, children: items("export-3", ["Blade", "Freeway", "Mesa", "ZR-350", "Euros", "Banshee", "Super GT", "Journey", "Huntley", "BF Injection"].map((name) => `Deliver ${name}`), false) }
  ] },
  { id: "safehouses", title: "Safe houses", description: "Purchase all 29 required safe houses.", items: items("safehouse", safeHouses) },
  { id: "businesses", title: "Businesses", items: items("business", ["Purchase Zero's RC Shop - $30,000", "Purchase Wang Cars - $50,000", "Purchase Verdant Meadows Airfield - $80,000"]) }
];

export const checklist: ChecklistCategory[] = categories;
export const TOTAL_OBJECTIVES = 187;

export function getCreditItems() {
  return checklist.flatMap((category) => category.items).filter((item) => item.credit !== false);
}
