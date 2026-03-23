import fs from "fs";
import path from "path";

async function main(): Promise<void> {
  const p = path.join(process.cwd(), "metrics-snapshot.json");
  const snap = {
    at: new Date().toISOString(),
    note: "wire to metrics export"
  };
  fs.writeFileSync(p, JSON.stringify(snap, null, 2));
  process.stdout.write(p + "\n");
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
