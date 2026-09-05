import mongoose from "mongoose";
import { execSync } from "child_process";

async function resolveSrvManually(uri) {
  const url = new URL(uri);
  const hostname = url.hostname;
  const srvOutput = execSync(`nslookup -type=SRV _mongodb._tcp.${hostname} 2>nul`, { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] });
  const hosts = [];
  const srvRegex = /svr hostname\s*=\s*(\S+)/g;
  let match;
  while ((match = srvRegex.exec(srvOutput)) !== null) hosts.push(`${match[1]}:27017`);
  if (hosts.length === 0) throw new Error("No SRV records found");
  let replicaSet = "", authSource = "admin";
  try {
    const txtOutput = execSync(`nslookup -type=TXT ${hostname} 2>nul`, { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] });
    const txtMatch = txtOutput.match(/text\s*=\s*\n?\s*"([^"]+)"/);
    if (txtMatch) { const p = new URLSearchParams(txtMatch[1]); if (p.has("replicaSet")) replicaSet = p.get("replicaSet"); if (p.has("authSource")) authSource = p.get("authSource"); }
  } catch {}
  return `mongodb://${url.username}:${url.password}@${hosts.join(",")}/?replicaSet=${replicaSet}&authSource=${authSource}&tls=true`;
}

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  try {
    if (uri.startsWith("mongodb+srv://")) {
      try { await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 }); console.log(`MongoDB connected: ${mongoose.connection.host}`); return; }
      catch (e) {
        if (e.codeName === "DNSSRVError" || e.message.includes("querySrv")) { console.log("[DB] SRV failed, using nslookup fallback..."); const d = await resolveSrvManually(uri); await mongoose.connect(d); console.log(`MongoDB connected: ${mongoose.connection.host}`); return; }
        throw e;
      }
    }
    const conn = await mongoose.connect(uri); console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) { console.error(`MongoDB connection error: ${error.message}`); process.exit(1); }
}
