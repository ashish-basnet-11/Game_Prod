import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const games = [
  { name: "Blazing Tiki",           emoji: "🌋", color: "#ff6b35", badge: "HOT", category: "Slots",       description: "Volcanic wilds and free spin fury await.",               isNew: false, sortOrder: 1  },
  { name: "Brilliant Diamonds",     emoji: "💎", color: "#00d4ff", badge: "NEW", category: "Slots",       description: "Gem-packed reels with cascading multipliers.",           isNew: true,  sortOrder: 2  },
  { name: "Volcano",                emoji: "🌊", color: "#ff4500", badge: "",    category: "Slots",       description: "Erupting paylines with lava bonus rounds.",             isNew: false, sortOrder: 3  },
  { name: "Super Fruit Blast",      emoji: "🍓", color: "#ff1744", badge: "TOP", category: "Slots",       description: "Juicy combos and a turbo spin feature.",                isNew: false, sortOrder: 4  },
  { name: "Vampire's Rite",         emoji: "🧛", color: "#7b1fa2", badge: "",    category: "Slots",       description: "Dark reels with bloodthirsty multipliers.",             isNew: false, sortOrder: 5  },
  { name: "Santa's Inn",            emoji: "🎅", color: "#b71c1c", badge: "",    category: "Slots",       description: "Festive free spins and gift-wrap wilds.",               isNew: false, sortOrder: 6  },
  { name: "5 Lions Megaways",       emoji: "🦁", color: "#f9a825", badge: "TOP", category: "Slots",       description: "Up to 117,649 ways to win every spin.",                 isNew: false, sortOrder: 7  },
  { name: "Clovers of Fortune",     emoji: "🍀", color: "#1b5e20", badge: "",    category: "Slots",       description: "Lucky reels with a pot-of-gold jackpot.",              isNew: false, sortOrder: 8  },
  { name: "Golden Pharaoh",         emoji: "🏺", color: "#ffd700", badge: "HOT", category: "Slots",       description: "Ancient Egypt riches with pyramid wilds.",              isNew: false, sortOrder: 9  },
  { name: "Neon Rush",              emoji: "⚡", color: "#c0ff00", badge: "NEW", category: "Slots",       description: "Cyberpunk reels with electric bonus rounds.",           isNew: true,  sortOrder: 10 },
  { name: "Dragon Tiger Gate",      emoji: "🐉", color: "#2e7d32", badge: "HOT", category: "Fish Games",  description: "Hunt mythical creatures for massive prizes.",           isNew: false, sortOrder: 11 },
  { name: "Ocean King 3",           emoji: "🐠", color: "#0288d1", badge: "TOP", category: "Fish Games",  description: "Multi-player fish hunting at its finest.",              isNew: false, sortOrder: 12 },
  { name: "Crab King",              emoji: "🦀", color: "#d84315", badge: "",    category: "Fish Games",  description: "Giant crabs and boss battles for big wins.",            isNew: false, sortOrder: 13 },
  { name: "Poseidon's Realm",       emoji: "🔱", color: "#0097a7", badge: "NEW", category: "Fish Games",  description: "Deep-sea adventure with deity multipliers.",            isNew: true,  sortOrder: 14 },
  { name: "Shark Attack",           emoji: "🦈", color: "#455a64", badge: "HOT", category: "Fish Games",  description: "High-octane shooting with chain explosions.",           isNew: false, sortOrder: 15 },
  { name: "Treasure Bowl",          emoji: "🪸", color: "#00897b", badge: "",    category: "Fish Games",  description: "Coral reef loot with jackpot net casts.",              isNew: false, sortOrder: 16 },
  { name: "Return of the Feature",  emoji: "🚗", color: "#1565c0", badge: "",    category: "Table Games", description: "Classic reels with a retro bonus feature.",            isNew: false, sortOrder: 17 },
  { name: "MX Mania",               emoji: "🏁", color: "#00695c", badge: "NEW", category: "Table Games", description: "Race-themed table action with pit-stop wilds.",         isNew: true,  sortOrder: 18 },
  { name: "Knockout Football Rush", emoji: "⚽", color: "#c62828", badge: "",    category: "Table Games", description: "Sports-style table game with overtime bonuses.",        isNew: false, sortOrder: 19 },
  { name: "Dragon vs Tiger",        emoji: "🐯", color: "#e65100", badge: "HOT", category: "Table Games", description: "The classic showdown — pick your side and win.",       isNew: false, sortOrder: 20 },
  { name: "Baccarat Royale",        emoji: "🃏", color: "#4a148c", badge: "TOP", category: "Table Games", description: "Elegant high-stakes baccarat with side bets.",         isNew: false, sortOrder: 21 },
  { name: "Roulette Gold",          emoji: "🎡", color: "#827717", badge: "",    category: "Table Games", description: "European roulette with a golden multiplier wheel.",    isNew: false, sortOrder: 22 },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@seemgreg.com" },
    update: {},
    create: {
      email: "admin@seemgreg.com",
      passwordHash,
      role: "admin",
    },
  });
  console.log("✅ Admin user created — email: admin@seemgreg.com / password: admin123");

  // Create superadmin user
  const superPasswordHash = await bcrypt.hash("super123", 12);
  await prisma.user.upsert({
    where: { email: "super@seemgreg.com" },
    update: {},
    create: {
      email: "super@seemgreg.com",
      passwordHash: superPasswordHash,
      role: "superadmin",
    },
  });
  console.log("✅ Superadmin user created — email: super@seemgreg.com / password: super123");
  console.log("⚠️  Change the password immediately after first login!");

  // Seed games
  for (const game of games) {
    await prisma.game.upsert({
      where: { id: game.name }, // won't match uuid, so always creates on first seed
      update: {},
      create: { ...game, isActive: true },
    }).catch(async () => {
      // Game already exists, skip
    });
  }

  // Simpler approach — deleteMany then createMany for a clean seed
  await prisma.game.deleteMany();
  await prisma.game.createMany({ data: games.map(g => ({ ...g, isActive: true })) });
  console.log(`✅ ${games.length} games seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
