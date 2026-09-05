import mongoose from "mongoose";
import { execSync } from "child_process";

async function resolveSrvManually(uri) {
  const url = new URL(uri);
  const hostname = url.hostname;

  const srvOutput = execSync(
    `nslookup -type=SRV _mongodb._tcp.${hostname} 2>nul`,
    { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] }
  );

  const hosts = [];
  const srvRegex = /svr hostname\s*=\s*(\S+)/g;
  let match;
  while ((match = srvRegex.exec(srvOutput)) !== null) {
    hosts.push(`${match[1]}:27017`);
  }

  if (hosts.length === 0) throw new Error("No SRV records found via nslookup");

  let replicaSet = "";
  let authSource = "admin";
  try {
    const txtOutput = execSync(
      `nslookup -type=TXT ${hostname} 2>nul`,
      { encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"] }
    );
    const txtMatch = txtOutput.match(/text\s*=\s*\n?\s*"([^"]+)"/);
    if (txtMatch) {
      const params = new URLSearchParams(txtMatch[1]);
      if (params.has("replicaSet")) replicaSet = params.get("replicaSet");
      if (params.has("authSource")) authSource = params.get("authSource");
    }
  } catch {}

  const user = url.username;
  const pass = url.password;
  const directUri = `mongodb://${user}:${pass}@${hosts.join(",")}/?replicaSet=${replicaSet}&authSource=${authSource}&tls=true`;
  console.log(`[DB] SRV resolved → ${hosts.length} hosts, replicaSet=${replicaSet}`);
  return directUri;
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  let finalUri = uri;

  try {
    if (uri.startsWith("mongodb+srv://")) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
        console.log(`MongoDB connected: ${mongoose.connection.host}`);
        return;
      } catch (srvErr) {
        if (srvErr.codeName === "DNSSRVError" || srvErr.message.includes("querySrv") || srvErr.message.includes("ECONNREFUSED")) {
          console.log("[DB] Native SRV failed, resolving via nslookup...");
          finalUri = await resolveSrvManually(uri);
        } else {
          throw srvErr;
        }
      }
    }

    const conn = await mongoose.connect(finalUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
