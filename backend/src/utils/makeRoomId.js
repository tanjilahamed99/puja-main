const crypto = require('crypto');

// Generates a short, unique room name to hand to LiveKit when a course
// session, free class, or specific puja booking is created.
// Actual LiveKit room creation / access-token signing (via
// 'livekit-server-sdk') can be layered on top of this id later.
const makeRoomId = (prefix) => `${prefix}-${crypto.randomBytes(4).toString('hex')}`;

module.exports = makeRoomId;
