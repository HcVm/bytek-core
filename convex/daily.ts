import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const approveAndCreateRoom = action({
    args: {
        messageId: v.id("clientMessages"),
    },
    handler: async (ctx, args) => {
        const DAILY_API_KEY = process.env.DAILY_API_KEY;
        if (!DAILY_API_KEY) {
            throw new Error("DAILY_API_KEY no está configurada en Convex Envs.");
        }

        const exp = Math.round(Date.now() / 1000) + 86400; // 24 hours

        const response = await fetch("https://api.daily.co/v1/rooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    exp,
                    enable_chat: true,
                    // Optionally restrict permissions here
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Daily API Error:", errorText);
            throw new Error("Failed to create room on Daily.co");
        }

        const room = await response.json();
        const roomUrl = room.url;

        // Update the meeting status securely on the database
        await ctx.runMutation(api.clientPortal.updateMeetingStatus, {
            messageId: args.messageId,
            status: "confirmed",
            meetingLink: roomUrl
        });

        return roomUrl;
    }
});
