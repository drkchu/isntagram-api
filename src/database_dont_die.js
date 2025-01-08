const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

cron.schedule('*/14 * * * *', async () => { // Updates every 14 minutes so that it doesn't spin down, kinda ugly
    try {
        const guestUser = await prisma.user.findUnique({
            where: { username: "guest" }
        });

        if (guestUser) {
            console.log("Database ping successful");
        } else {
            console.log("Guest user not found. Please check the database.");
        }
    } catch (error) {
        console.error("Database ping error:", error);
    }
});

module.exports = cron;
