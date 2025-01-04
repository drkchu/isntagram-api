const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

cron.schedule('11 23 * * *', async () => {
    try {
        const guestUser = await prisma.user.findUnique({
            where: { username: "guest" }
        });

        if (guestUser) {
            console.log("Database ping successful - Guest user accessed at 11:11 PM Server time");
        } else {
            console.log("Guest user not found. Please check the database.");
        }
    } catch (error) {
        console.error("Database ping error:", error);
    }
});

module.exports = cron;
