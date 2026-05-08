import { getDb } from "../api/queries/connection.js";
import {
  users,
  tipsterProfiles,
  tips,
  learnArticles,
  platformSettings,
} from "./schema.js";

const db = getDb();

async function seed() {
  console.log("Seeding database...");

  // Seed platform settings
  await db.insert(platformSettings).values([
    { key: "vip_monthly_price", value: "15000" },
    { key: "vip_quarterly_price", value: "35000" },
    { key: "vip_annual_price", value: "100000" },
    { key: "platform_name", value: "TipZone UG" },
    { key: "min_payout", value: "10000" },
  ]);
  console.log("Platform settings seeded");

  // Seed learn articles
  await db.insert(learnArticles).values([
    {
      title: "Understanding Betting Odds",
      slug: "understanding-betting-odds",
      content: `# Understanding Betting Odds\n\nBetting odds represent the probability of an event occurring and determine how much you can win.\n\n## Decimal Odds\n\nDecimal odds are the most common format. Simply multiply your stake by the odds to calculate potential returns.\n\n**Example:** UGX 10,000 bet at odds of 2.50 = UGX 25,000 potential return\n\n## Probability Implied by Odds\n\nLower odds = higher probability of winning but lower returns\nHigher odds = lower probability but higher potential returns\n\n## Value Betting\n\nLook for odds that underestimate the true probability of an outcome. This is where long-term profit comes from.`,
      category: "beginner",
      language: "en",
      readTimeMinutes: 5,
    },
    {
      title: "Bankroll Management",
      slug: "bankroll-management",
      content: `# Bankroll Management\n\nThe most important skill in sports betting is managing your money.\n\n## The 1-5% Rule\n\nNever bet more than 1-5% of your total bankroll on a single wager.\n\n## Flat Staking vs. Variable Staking\n\n- **Flat staking:** Same amount on every bet\n- **Variable staking:** Adjust based on confidence level\n\n## Setting Limits\n\nDecide your monthly betting budget before you start and stick to it. Never chase losses.\n\n## Track Everything\n\nKeep records of all your bets to analyze performance over time.`,
      category: "strategy",
      language: "en",
      readTimeMinutes: 7,
    },
    {
      title: "How to Read Football Stats",
      slug: "how-to-read-football-stats",
      content: `# How to Read Football Stats\n\nKey statistics to analyze before placing a bet:\n\n## Team Form\n\nLook at the last 5-10 matches. Consider home vs. away form separately.\n\n## Head-to-Head Records\n\nSome teams consistently struggle against specific opponents regardless of form.\n\n## Goals Data\n\n- Average goals scored/conceded per game\n- Both Teams to Score (BTTS) percentage\n- Over/Under 2.5 goals trends\n\n## Injuries and Suspensions\n\nMissing key players can dramatically change a team's performance.\n\n## Motivation and Context\n\nCup finals, derby matches, and relegation battles often produce different intensity levels.`,
      category: "how-to",
      language: "en",
      readTimeMinutes: 6,
    },
    {
      title: "Accumulator Betting Guide",
      slug: "accumulator-betting-guide",
      content: `# Accumulator Betting Guide\n\nAccumulators (accas) combine multiple selections into one bet for higher returns.\n\n## How They Work\n\nAll selections must win for the accumulator to pay out. The odds multiply together.\n\n**Example:** 3 selections at 2.00, 1.80, and 2.20 = total odds of 7.92\n\n## Pros and Cons\n\n**Pros:**\n- Much higher potential returns\n- Small stakes can win big\n\n**Cons:**\n- Higher risk (all must win)\n- Harder to be profitable long-term\n\n## Tips for Accas\n\n- Limit to 2-5 selections\n- Mix favorites with value picks\n- Avoid picking all heavy favorites (low returns)\n- Consider insurance offers from bookmakers`,
      category: "strategy",
      language: "en",
      readTimeMinutes: 8,
    },
    {
      title: "Responsible Betting Guidelines",
      slug: "responsible-betting-guidelines",
      content: `# Responsible Betting Guidelines\n\nBetting should be entertainment, not a way to make money.\n\n## Golden Rules\n\n1. **Only bet what you can afford to lose**\n2. **Never chase losses** - accept losing days\n3. **Set time limits** on your betting activity\n4. **Don't bet under the influence** of alcohol or emotions\n5. **Take breaks** regularly\n\n## Warning Signs\n\n- Borrowing money to bet\n- Hiding betting from family\n- Betting more than planned\n- Feeling anxious about betting\n\n## Getting Help\n\nIf you or someone you know has a gambling problem, seek help from professional organizations.\n\nRemember: Only stake what you can afford to lose.`,
      category: "beginner",
      language: "en",
      readTimeMinutes: 4,
    },
  ]);
  console.log("Learn articles seeded");

  console.log("Database seeded successfully!");
}

seed().catch(console.error);
