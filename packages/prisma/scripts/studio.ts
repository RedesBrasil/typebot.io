import { executePrismaCommand } from "./executeCommand";

// Set BROWSER env var before running studio (works on both Windows and Linux)
process.env.BROWSER = "none";

executePrismaCommand("prisma studio");
