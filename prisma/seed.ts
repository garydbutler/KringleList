import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed interests (common gift categories)
  const interests = [
    "Art & Crafts",
    "Books",
    "Building & Construction",
    "Dolls & Figures",
    "Electronics",
    "Games & Puzzles",
    "Music & Instruments",
    "Outdoor & Sports",
    "Science & STEM",
    "Stuffed Animals",
    "Vehicles & Remote Control",
    "Dress-Up & Pretend Play",
  ];

  // Seed values (gift attributes)
  const values = [
    "STEM",
    "screen-free",
    "sensory-friendly",
    "eco",
    "educational",
    "creative",
    "active",
    "quiet",
  ];

  // Age bands are defined in the enum, but we can log them for reference
  const ageBands = ["0-2", "3-4", "5-7", "8-10", "11-13", "14+"];

  console.log(`✅ Reference data:`);
  console.log(`   - ${interests.length} interests: ${interests.join(", ")}`);
  console.log(`   - ${values.length} values: ${values.join(", ")}`);
  console.log(`   - ${ageBands.length} age bands: ${ageBands.join(", ")}`);

  // Seed sample merchants for testing
  const merchants = [
    {
      name: "Amazon",
      slug: "amazon",
      affiliateProgram: "amazon-associates",
      baseCommissionPct: 4.0,
      logoUrl: "https://logo.clearbit.com/amazon.com",
      status: "ACTIVE" as const,
    },
    {
      name: "Target",
      slug: "target",
      affiliateProgram: "impact",
      baseCommissionPct: 3.5,
      logoUrl: "https://logo.clearbit.com/target.com",
      status: "ACTIVE" as const,
    },
    {
      name: "Walmart",
      slug: "walmart",
      affiliateProgram: "impact",
      baseCommissionPct: 4.0,
      logoUrl: "https://logo.clearbit.com/walmart.com",
      status: "ACTIVE" as const,
    },
  ];

  for (const merchant of merchants) {
    await prisma.merchant.upsert({
      where: { slug: merchant.slug },
      update: merchant,
      create: merchant,
    });
  }

  console.log(`✅ Seeded ${merchants.length} merchants`);

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
