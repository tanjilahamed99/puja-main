const { AccessToken } = require("livekit-server-sdk");

// Signs a short-lived LiveKit access token for one user to join one room.
// This runs entirely locally (no network call to LiveKit needed to mint
// the token) — LIVEKIT_API_KEY/LIVEKIT_API_SECRET just need to match
// whatever your LiveKit server (Cloud or self-hosted) was configured with.
async function createLiveKitToken({ roomName, identity, name }) {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: "2h",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
}

module.exports = { createLiveKitToken };