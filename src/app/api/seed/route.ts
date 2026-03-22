import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed not allowed in production" }, { status: 403 });
  }

  // Clean existing data
  await db.approvalQueueItem.deleteMany();
  await db.keyword.deleteMany();
  await db.videoScript.deleteMany();
  await db.googleAdCopy.deleteMany();
  await db.seoArticle.deleteMany();
  await db.socialPost.deleteMany();
  await db.automationWorkflow.deleteMany();
  await db.campaign.deleteMany();

  // Campaign 1: Land to Yield
  const landToYield = await db.campaign.create({
    data: {
      name: "Land to Yield",
      slug: "land-to-yield",
      appName: "Land to Yield",
      industry: "Real Estate / Land Investment",
      brandVoice:
        "Confident, educational, and approachable. We speak to aspiring land investors who want to build wealth through smart land acquisitions. Think friendly mentor with data-backed insights. Humor is welcome — especially with our Corgi mascot.",
      targetAudience: JSON.stringify({
        demographics: "Ages 25-55, income $60k+, interested in real estate investing",
        painPoints: [
          "Don't know where to start with land investing",
          "Overwhelmed by traditional real estate complexity",
          "Want passive income but lack guidance",
        ],
        goals: [
          "Build long-term wealth through land",
          "Find undervalued parcels",
          "Calculate ROI confidently",
        ],
      }),
      valueProposition:
        "Land to Yield helps you find, analyze, and profit from land investments with AI-powered yield calculations, market analysis, and deal scoring — so you can build wealth without the complexity of traditional real estate.",
      budgetMonthly: 2000,
      status: "active",
      primaryColor: "#16a34a",
    },
  });

  // Campaign 2: Professional Scheduler
  const proScheduler = await db.campaign.create({
    data: {
      name: "Professional Scheduler",
      slug: "professional-scheduler",
      appName: "Professional Scheduler",
      industry: "SaaS / Productivity",
      brandVoice:
        "Professional yet personable. We talk to busy professionals and small business owners who are drowning in scheduling chaos. Clean, efficient, and solution-oriented. Corgi commercials should emphasize the relief of having everything organized.",
      targetAudience: JSON.stringify({
        demographics: "Ages 28-50, professionals, small business owners, freelancers",
        painPoints: [
          "Double-bookings and missed appointments",
          "Too much time spent on back-and-forth scheduling",
          "No centralized view of availability",
        ],
        goals: [
          "Automate appointment booking",
          "Reduce no-shows",
          "Look professional to clients",
        ],
      }),
      valueProposition:
        "Professional Scheduler eliminates scheduling chaos with smart booking pages, automated reminders, and calendar sync — so you never miss an appointment and always look professional.",
      budgetMonthly: 1500,
      status: "active",
      primaryColor: "#2563eb",
    },
  });

  // Sample video scripts
  await db.videoScript.createMany({
    data: [
      {
        campaignId: landToYield.id,
        title: "Corgi Finds Gold — Land Investing Made Easy",
        style: "corgi-commercial",
        script: `[SCENE 1 - INT. LIVING ROOM - DAY]
A Corgi sits at a laptop, wearing tiny reading glasses. On screen: a map with highlighted land parcels.

NARRATOR (V.O.): "While everyone's fighting over houses... Cooper the Corgi found something better."

[SCENE 2 - EXT. BEAUTIFUL VACANT LAND - DAY]
Cooper trots across a scenic piece of land, tail wagging.

NARRATOR (V.O.): "Land. No tenants. No toilets. No drama."

[SCENE 3 - SCREEN CAPTURE]
Land to Yield app interface showing yield calculations.

NARRATOR (V.O.): "Land to Yield shows you exactly what each parcel can earn. AI-powered analysis. Real numbers. Real opportunity."

[SCENE 4 - INT. LIVING ROOM]
Cooper pushes laptop toward camera with his paw.

NARRATOR (V.O.): "Start finding profitable land today. Download Land to Yield."

SUPER: LandToYield.com | Download Free`,
        shotList: JSON.stringify([
          "Corgi at laptop with glasses - 8 seconds",
          "Aerial shot of beautiful land - 6 seconds",
          "App screen capture with yield calculator - 10 seconds",
          "Corgi pushing laptop to camera - 6 seconds",
        ]),
        voiceoverText:
          "While everyone's fighting over houses, Cooper found something better. Land. No tenants, no toilets, no drama. Land to Yield shows you exactly what each parcel can earn. Start finding profitable land today.",
        duration: 30,
        approvalStatus: "draft",
      },
      {
        campaignId: proScheduler.id,
        title: "Corgi Never Double-Books — Professional Scheduler",
        style: "corgi-commercial",
        script: `[SCENE 1 - INT. CHAOTIC OFFICE - DAY]
Papers flying, phone ringing off the hook. A frazzled business owner looks at overlapping calendar entries.

NARRATOR (V.O.): "Ever feel like your schedule is running you?"

[SCENE 2 - ENTER CORGI]
Cooper the Corgi walks in wearing a tiny business vest, drops a tablet on the desk.

NARRATOR (V.O.): "Cooper says: there's a better way."

[SCENE 3 - SCREEN CAPTURE]
Professional Scheduler interface: clean booking page, automated reminders, calendar sync.

NARRATOR (V.O.): "Professional Scheduler handles your bookings, sends reminders, and syncs everything. Automatically."

[SCENE 4 - INT. CALM OFFICE]
Same office, now organized. Owner sips coffee while Cooper naps on a dog bed. Phone shows "3 appointments confirmed."

NARRATOR (V.O.): "Take back your time. Try Professional Scheduler free."

SUPER: ProScheduler.com | Start Free`,
        shotList: JSON.stringify([
          "Chaotic office scene - 7 seconds",
          "Corgi enters with tablet - 5 seconds",
          "App screen capture - 10 seconds",
          "Calm office resolution - 8 seconds",
        ]),
        voiceoverText:
          "Ever feel like your schedule is running you? Cooper says there's a better way. Professional Scheduler handles your bookings, sends reminders, and syncs everything automatically. Take back your time.",
        duration: 30,
        approvalStatus: "draft",
      },
    ],
  });

  // Sample Google Ad copies
  await db.googleAdCopy.createMany({
    data: [
      {
        campaignId: landToYield.id,
        adGroupName: "Land Investing - General",
        headlines: JSON.stringify([
          "Invest in Land Smarter",
          "AI-Powered Land Analysis",
          "Find Profitable Land Deals",
          "Land Investing Made Easy",
          "Calculate Land Yields Fast",
          "No Tenants No Drama",
          "Build Wealth With Land",
          "Free Land Investment Tool",
          "Analyze Any Land Parcel",
          "Smart Land Investing App",
        ]),
        descriptions: JSON.stringify([
          "Stop guessing. Land to Yield uses AI to analyze land parcels and calculate real ROI. Start investing smarter today.",
          "Find undervalued land, calculate yields, and build wealth. No real estate experience needed. Try free.",
          "The smart way to invest in land. AI-powered analysis, yield calculations, and deal scoring. Download now.",
        ]),
        finalUrl: "https://landtoyield.com",
        pathField1: "land",
        pathField2: "invest",
        approvalStatus: "draft",
      },
      {
        campaignId: proScheduler.id,
        adGroupName: "Scheduling Software - General",
        headlines: JSON.stringify([
          "Stop Double-Booking Clients",
          "Smart Scheduling Software",
          "Automate Your Bookings",
          "Free Professional Scheduler",
          "End Scheduling Chaos Now",
          "Booking Pages That Convert",
          "Automated Appointment Reminders",
          "Calendar Sync Made Easy",
          "Look Professional Book Easy",
          "Scheduling for Small Business",
        ]),
        descriptions: JSON.stringify([
          "Professional Scheduler eliminates double-bookings and no-shows. Automated reminders, calendar sync, and custom booking pages. Try free.",
          "Stop the back-and-forth emails. Let clients book directly from your professional scheduling page. Set up in 5 minutes.",
          "The scheduling tool built for busy professionals. Automated reminders reduce no-shows by 80%. Start free today.",
        ]),
        finalUrl: "https://proscheduler.com",
        pathField1: "scheduling",
        pathField2: "free",
        approvalStatus: "draft",
      },
    ],
  });

  // Sample keywords
  await db.keyword.createMany({
    data: [
      { campaignId: landToYield.id, term: "land investing", searchVolume: 8100, difficulty: 45, cpc: 2.5 },
      { campaignId: landToYield.id, term: "how to invest in land", searchVolume: 5400, difficulty: 38, cpc: 1.8 },
      { campaignId: landToYield.id, term: "land investment calculator", searchVolume: 1900, difficulty: 28, cpc: 3.2 },
      { campaignId: landToYield.id, term: "vacant land for sale", searchVolume: 22000, difficulty: 62, cpc: 1.5 },
      { campaignId: landToYield.id, term: "raw land ROI", searchVolume: 720, difficulty: 22, cpc: 2.1 },
      { campaignId: proScheduler.id, term: "appointment scheduling software", searchVolume: 6600, difficulty: 55, cpc: 8.5 },
      { campaignId: proScheduler.id, term: "online booking system", searchVolume: 9900, difficulty: 58, cpc: 7.2 },
      { campaignId: proScheduler.id, term: "free scheduling app", searchVolume: 12000, difficulty: 42, cpc: 4.8 },
      { campaignId: proScheduler.id, term: "client booking page", searchVolume: 2400, difficulty: 30, cpc: 5.5 },
      { campaignId: proScheduler.id, term: "reduce no shows", searchVolume: 1300, difficulty: 25, cpc: 3.9 },
    ],
  });

  return NextResponse.json({
    success: true,
    campaigns: [
      { name: landToYield.name, slug: landToYield.slug },
      { name: proScheduler.name, slug: proScheduler.slug },
    ],
  });
}
