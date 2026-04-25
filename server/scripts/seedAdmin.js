const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");

    const email = process.env.SEED_ADMIN_EMAIL || "admin@srinivas.edu";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin123";

    // Delete existing test admin if exists
    await Admin.findOneAndDelete({ email });

    // Generate unique code
    const generateInviteCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let inviteCode;
    let isUnique = false;
    let retries = 0;

    while (!isUnique && retries < 10) {
      inviteCode = generateInviteCode();
      const existingCode = await Admin.findOne({ inviteCode });
      if (!existingCode) {
        isUnique = true;
      }
      retries++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate a unique invite code.");
    }

    const admin = await Admin.create({
      name: "Placement Cell",
      email,
      password,
      collegeName: "Srinivas University",
      collegeLocation: "Mukka, Mangalore",
      inviteCode,
    });

    console.log("✅ Test Admin Seeded Successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Invite Code: ${admin.inviteCode}`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
