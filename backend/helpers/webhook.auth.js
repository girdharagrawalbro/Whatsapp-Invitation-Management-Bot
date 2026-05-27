const twilio = require('twilio');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

/**
 * STEP 1 — Validate the request is genuinely from Twilio.
 * Without this, anyone could POST to your webhook endpoint.
 */
const validateTwilioSignature = (req, res, next) => {
    const authToken = process.env.TWILIO_MASTER_AUTH_TOKEN;
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = process.env.WEBHOOK_BASE_URL + req.originalUrl;

    const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        url,
        req.body
    );

    if (!isValid) {
        console.warn('[Webhook] Invalid Twilio signature — rejected');
        return res.status(403).send('Forbidden');
    }
    next();
};

/**
 * STEP 2 — Resolve which Organisation and User this message belongs to.
 *
 * Twilio payload always contains:
 *   To:   the WhatsApp number the user messaged  → identifies the Org
 *   From: the user's own WhatsApp number         → identifies the User
 *
 * Both are in the format "whatsapp:+91XXXXXXXXXX"
 */
const resolveOrgAndUser = async (req, res, next) => {
    const toNumber = req.body.To;     // e.g. "whatsapp:+919800100001"
    const fromNumber = req.body.From; // e.g. "whatsapp:+919800100002"

    if (!toNumber || !fromNumber) {
        return res.status(400).send('Bad Request');
    }

    try {
        // Look up the Org by the WhatsApp number the message arrived on
        const org = await Organisation.findOne({
            'twilio.whatsappNumber': toNumber,
            isActive: true,
        });

        if (!org) {
            console.warn(`[Webhook] No active org found for number: ${toNumber}`);
            // Silently ignore — could be a test message to a deprovisioned number
            return res.sendStatus(200);
        }

        // Strip the "whatsapp:" prefix to match our stored phone format
        const userPhone = fromNumber.replace('whatsapp:', '');

        const user = await User.findOne({
            orgId: org._id,
            phone: userPhone,
            isActive: true,
        });

        if (!user) {
            // User messaged the org number but isn't registered
            // Reply with a registration prompt via Twilio
            await sendUnregisteredReply(toNumber, fromNumber, org);
            return res.sendStatus(200);
        }

        // Attach to req so downstream handlers don't need to re-query
        req.org = org;
        req.user = user;

        // Update last active timestamp (fire-and-forget)
        User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() }).exec();

        next();
    } catch (err) {
        console.error('[Webhook] resolveOrgAndUser error:', err);
        res.sendStatus(500);
    }
};

/**
 * Reply to an unregistered phone number with a registration link.
 */
const sendUnregisteredReply = async (toNumber, fromNumber, org) => {
    try {
        const client = twilio(
            org.twilio.subAccountSid,
            org.twilio.subAccountToken
        );

        const registrationUrl = `${process.env.APP_BASE_URL}/register/${org._id}`;
        const message =
            org.defaultLanguage === 'hi'
                ? `नमस्ते! Invitely में स्वागत है। कृपया इस लिंक पर रजिस्टर करें: ${registrationUrl}`
                : `Hello! Please register to use Invitely: ${registrationUrl}`;

        await client.messages.create({
            from: toNumber,
            to: fromNumber,
            body: message,
        });
    } catch (err) {
        console.error('[Webhook] Failed to send registration reply:', err);
    }
};

module.exports = { validateTwilioSignature, resolveOrgAndUser };