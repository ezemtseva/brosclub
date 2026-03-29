import { settleAndRecalculate } from "../lib/pl-settle"

async function run() {
  console.log("Settling all bets with new rules...")
  const settled = await settleAndRecalculate()
  console.log(`Settled ${settled} bets`)
}

run().catch((e) => { console.error(e); process.exit(1) })
