import mongoose from "mongoose";

export function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Intercepts requests that rely on MongoDB and returns high-fidelity mock data
 * if the database is offline (unconfigured or unreachable).
 */
export function mockDbMiddleware(req, res, next) {
  if (isDbConnected()) {
    return next();
  }

  const method = req.method;
  const path = req.path;

  // Print a warning once per offline request
  console.warn(`[WARN] Database offline. Serving mock response for: ${method} ${path}`);

  // Authentication endpoints
  if (path === "/auth/register" || path === "/auth/login") {
    const email = req.body.email || "demo@chamatrust.org";
    const name = req.body.fullName || email.split("@")[0];
    return res.status(200).json({
      token: "demo-jwt-token-for-unconfigured-vercel-db",
      user: {
        id: "demo-user-id",
        fullName: name,
        email: email,
        phone: req.body.phone || "+255700000000",
        walletAddress: null,
        role: "member"
      }
    });
  }

  if (path === "/auth/link-wallet") {
    return res.status(200).json({
      token: "demo-jwt-token-for-unconfigured-vercel-db",
      user: {
        id: "demo-user-id",
        fullName: "Demo User",
        email: "demo@chamatrust.org",
        phone: "+255700000000",
        walletAddress: req.body.address,
        role: "member"
      }
    });
  }

  // Chamas endpoints
  if (path === "/chamas") {
    if (method === "GET") {
      return res.json({
        chamas: [
          {
            _id: "60b9f1a2c3d4e5f6a7b8c9d0",
            name: "Kilimo Bora Chama",
            country: "TZ",
            currency: "TZS",
            minimumContribution: 20000,
            quorum: 3,
            treasuryAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
            phone: "+255711222333",
            members: [
              { walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", phone: "+255711222333", role: "admin", trustScore: 90 }
            ]
          }
        ]
      });
    }
    if (method === "POST") {
      return res.status(201).json({
        chama: {
          _id: "60b9f1a2c3d4e5f6a7b8c9d0",
          ...req.body,
          members: [
            { walletAddress: req.user?.walletAddress || req.user?.sub || "demo-user-id", phone: req.body.phone || "+255700000000", role: "admin", trustScore: 80 }
          ]
        }
      });
    }
  }

  if (path.startsWith("/chamas/") && path.endsWith("/join") && method === "POST") {
    const parts = path.split("/");
    const id = parts[2];
    return res.json({
      chama: {
        _id: id,
        name: "Kilimo Bora Chama",
        country: "TZ",
        currency: "TZS",
        minimumContribution: 20000,
        quorum: 3,
        treasuryAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        phone: "+255711222333",
        members: [
          { walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", phone: "+255711222333", role: "admin", trustScore: 90 },
          { walletAddress: req.user?.walletAddress || req.user?.sub || "demo-user-id", phone: req.body.phone || "+255700000000", role: "member", trustScore: 50 }
        ]
      }
    });
  }

  if (path.startsWith("/chamas/") && path.endsWith("/invite") && method === "POST") {
    const parts = path.split("/");
    const id = parts[2];
    return res.json({
      chama: {
        _id: id,
        name: "Kilimo Bora Chama",
        country: "TZ",
        currency: "TZS",
        minimumContribution: 20000,
        quorum: 3,
        treasuryAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        phone: "+255711222333",
        members: [
          { walletAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", phone: "+255711222333", role: "admin", trustScore: 90 },
          { walletAddress: req.body.walletAddress, phone: req.body.phone, role: "member", trustScore: 50 }
        ]
      }
    });
  }

  // Loans endpoints
  if (path === "/loans") {
    if (method === "GET") {
      return res.json({
        loans: [
          {
            _id: "loan-id-1",
            chamaId: "60b9f1a2c3d4e5f6a7b8c9d0",
            borrower: "demo-user-id",
            amount: 250000,
            purpose: "Fertilizer purchase for tomato farm",
            riskLevel: "Low",
            proposalId: "LN-ABC12345",
            status: "pending",
            votes: []
          }
        ]
      });
    }
    if (method === "POST") {
      return res.status(201).json({
        loan: {
          _id: "loan-id-1",
          chamaId: req.body.chamaId,
          borrower: req.user?.sub || "demo-user-id",
          amount: req.body.amount,
          purpose: req.body.purpose,
          riskLevel: "Low",
          proposalId: "LN-NEWLOAN1",
          status: "pending",
          votes: []
        },
        advisor: { level: "Low", score: 85, recommendation: "Recommended" }
      });
    }
  }

  if (path.startsWith("/loans/") && path.endsWith("/vote") && method === "POST") {
    const parts = path.split("/");
    const id = parts[2];
    return res.json({
      loan: {
        _id: id,
        chamaId: "60b9f1a2c3d4e5f6a7b8c9d0",
        borrower: "demo-user-id",
        amount: 250000,
        purpose: "Fertilizer purchase for tomato farm",
        riskLevel: "Low",
        proposalId: "LN-ABC12345",
        status: "pending",
        votes: [{ voter: req.user?.sub || "demo-user-id", support: req.body.support, reason: req.body.reason || "" }]
      }
    });
  }

  // Meetings endpoints
  if (path === "/meetings") {
    if (method === "GET") {
      return res.json({
        meetings: [
          {
            id: "meeting-1",
            title: "Annual Fertilizer Planning",
            scheduledFor: new Date(),
            durationMinutes: 45,
            status: "completed",
            attendees: ["Grace Wanjiku", "Benjamin Otieno", "Amina Hassan"],
            summary: "Reviewed contributions and authorized agricultural fertilizer loan requests.",
            decisions: ["Increase contributions next month.", "Approve Grace's fertilizer loan."],
            actionItems: [{ assignee: "Treasurer", task: "Disburse loans", due: "Next Monday", status: "open" }],
            aiConfidence: 95
          }
        ],
        source: "mock"
      });
    }
    if (method === "POST") {
      return res.status(201).json({
        meeting: {
          id: "meeting-2",
          title: req.body.title || "Quick Check-in",
          scheduledFor: req.body.scheduledFor || new Date(),
          durationMinutes: req.body.durationMinutes || 15,
          status: "completed",
          attendees: req.body.attendees || ["Grace Wanjiku"],
          summary: req.body.summary || "Discussed weekly updates.",
          decisions: req.body.decisions || [],
          actionItems: req.body.actionItems || [],
          aiConfidence: req.body.aiConfidence || 92
        },
        source: "mock"
      });
    }
  }

  if (path === "/meetings/latest" && method === "GET") {
    return res.json({
      meeting: {
        id: "meeting-1",
        title: "Annual Fertilizer Planning",
        scheduledFor: new Date(),
        durationMinutes: 45,
        status: "completed",
        attendees: ["Grace Wanjiku", "Benjamin Otieno", "Amina Hassan"],
        summary: "Reviewed contributions and authorized agricultural fertilizer loan requests.",
        decisions: ["Increase contributions next month.", "Approve Grace's fertilizer loan."],
        actionItems: [{ assignee: "Treasurer", task: "Disburse loans", due: "Next Monday", status: "open" }],
        aiConfidence: 95
      },
      source: "mock"
    });
  }

  // Mobile Money endpoints
  if (path === "/mobile-money/deposit" && method === "POST") {
    const ref = "DEP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    return res.status(202).json({
      transaction: {
        chamaId: req.body.chamaId || "60b9f1a2c3d4e5f6a7b8c9d0",
        member: req.user?.sub || "demo-user-id",
        provider: req.body.provider,
        direction: "deposit",
        amount: req.body.amount,
        phone: req.body.phone,
        reference: ref,
        status: req.body.provider === "Pesapal" ? "initiated" : "prompted"
      },
      mobileMoney: {
        reference: ref,
        status: req.body.provider === "Pesapal" ? "initiated" : "prompted",
        paymentUrl: req.body.provider === "Pesapal" ? "https://demo.pesapal.com/checkout" : null
      }
    });
  }

  if (path === "/mobile-money/withdraw" && method === "POST") {
    const ref = "WTH-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    return res.status(202).json({
      transaction: {
        chamaId: req.body.chamaId || "60b9f1a2c3d4e5f6a7b8c9d0",
        member: req.user?.sub || "demo-user-id",
        provider: req.body.provider,
        direction: "withdrawal",
        amount: req.body.amount,
        phone: req.body.phone,
        reference: ref,
        status: "prompted"
      },
      mobileMoney: {
        reference: ref,
        status: "prompted"
      }
    });
  }

  // Transactions endpoints
  if (path === "/transactions" && method === "GET") {
    return res.json({ transactions: [] });
  }

  if (path.startsWith("/transactions/") && method === "GET") {
    const parts = path.split("/");
    const ref = parts[2];
    return res.json({
      transaction: {
        reference: ref,
        status: "confirmed",
        provider: "M-Pesa",
        direction: "deposit",
        amount: 20000,
        phone: "+255700000000"
      }
    });
  }

  return next();
}
