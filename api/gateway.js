import express from "express";
import streams, { getStream } from "./streams.js";
import attachments from "./attachments.js";
import { authenticate } from "./auth.js";
import { getUserSession, createRoom, getRoom } from "../storage/data.js";

const router = new express.Router();
const roomRegex = /[a-z0-9_]*/g;

let userSubscriptions = new Map();

router.post("/rooms/:roomname/join", async (req, res) => {
    let { roomname } = req.params;

    let userSession = await getUserSession(req.user.id);

    if (!isValidRoomname(roomname)) return res.status(400).json({
        error: true,
        message: "Invalid room name",
        code: 301
    });

    if (userSession.rooms.has(roomname)) return res.status(400).json({
        error: true,
        message: "Already joined this room",
        code: 302
    });

    let room = await getRoom(roomname);

    if (room === null) return res.status(400).json({
        error: true,
        message: "Room doesn't exist",
        code: 303
    });

    await userSession.joinRoom(roomname);

    for (let id of room.members) {
        if (id === req.user.id) continue;
      
        let stream = getStream(id);
        if (stream === null) continue;
      
        stream.json({
            room: roomname,
            id: req.user.id,
            timestamp: Date.now(),
            state: "join"
        }, "updateMember");
    }

    res.status(200).json({
        name: room.name,
        description: room.description
    });
});

router.post("/rooms/:roomname/leave", async (req, res) => {
    let { roomname } = req.params;

    let userSession = await getUserSession(req.user.id);

    if (!userSession.rooms.has(roomname)) return res.status(400).json({
        error: true,
        message: "Cannot leave a room that you are already not in",
        code: 306
    });

    let room = await getRoom(roomname);

    if (room === null) return res.status(400).json({
        error: true,
        message: "Room doesn't exist",
        code: 303
    });

    await userSession.leaveRoom(roomname);

    for (let id of room.members) {
        if (id === req.user.id) continue;

        let stream = getStream(id);
        if (stream === null) continue;

        stream.json({
            room: roomname,
            id: req.user.id,
            timestamp: Date.now(),
            state: "leave"
        }, "updateMember");
    }

    res.status(200).json({
        success: true
    });
});

router.get("/rooms/:roomname/members", async (req, res) => {
    let { roomname } = req.params;

    let userSession = await getUserSession(req.user.id);

    if (!userSession.rooms.has(roomname)) return res.status(400).json({
        error: true,
        message: "Cannot query info about a room that you are not in",
        code: 307
    });

    let room = await getRoom(roomname);

    if (room === null) return res.status(400).json({
        error: true,
        message: "Room doesn't exist",
        code: 303
    });

    res.status(200).json({
        members: Array.from(room.members)
    });
});

router.post("/rooms/:roomname/create", async (req, res) => {
    let { roomname } = req.params;

    if (!isValidRoomname(roomname)) return res.status(400).json({
        error: true,
        message: "Invalid room name",
        code: 301
    });

    let room = await createRoom(roomname);

    if (room === false) return res.status(400).json({
        error: true,
        message: "Room already exists",
        code: 305
    });
    
    res.status(200).json({
        success: true
    });
});

router.post("/rooms/:roomname/message", async (req, res) => {
    let { roomname } = req.params;
    let { content, attachments } = req.body;

    if (typeof content !== "string" || !Array.isArray(attachments)) return res.status(400).json({
        error: true,
        message: "Invalid body",
        code: 101
    });

    if (content.length > 1000 || content.replace(/\s/g, '').length == 0) return res.status(400).json({
        error: true,
        message: "Invalid message content",
        code: 201
    });

    let userSession = await getUserSession(req.user.id);

    if (!userSession.rooms.has(roomname)) return res.status(400).json({
        error: true,
        message: "Cannot send a message in a room that you are not in",
        code: 304
    });

    let room = await getRoom(roomname);

    if (room === null) return res.status(400).json({
        error: true,
        message: "Room doesn't exist",
        code: 303
    });

    for (let id of room.members) {
        let stream = getStream(id);
        if (stream === null) continue;

        stream.json({
            author: {
              username: req.user.username,
              color: req.user.color,
              discriminator: req.user.discriminator
            },
            room: roomname,
            content: content,
            attachments: attachments,
            timestamp: Date.now()
        }, "message");
    }

    res.status(200).json({
        success: true
    });
});

const typingUsers = new Map();

router.post("/rooms/:roomname/typing", async (req, res) => {
    const { roomname } = req.params;

    const userSession = await getUserSession(req.user.id);

    if (!userSession.rooms.has(roomname)) {
        return res.status(400).json({
            error: true,
            message: "Cannot send typing notification in a room that you are not in",
            code: 304
        });
    }

    const room = await getRoom(roomname);

    if (room === null) {
        return res.status(400).json({
            error: true,
            message: "Room doesn't exist",
            code: 303
        });
    }

    const { typing } = req.body;

    if (typing) {
        // User started typing
        typingUsers.set(req.user.id, roomname);
    } else {
        // User stopped typing
        typingUsers.delete(req.user.id);
    }

    // Broadcast typing status to all room members
    for (const id of room.members) {
        if (id === req.user.id) continue;

        const stream = getStream(id);
        if (stream === null) continue;

        stream.json({
            event: "typing",
            room: roomname,
            user: {
                id: req.user.id,
                username: req.user.username
            },
            typing: typing
        });
    }

    res.status(200).json({
        success: true
    });
});

router.get("/users", async (req, res) => {
    let { ids, subscribe } = req.query;

    if (typeof ids !== "string") {
        return res.status(400).json({
            error: true,
            message: "Missing query string",
            code: 102
        });
    }

    let sessionIds = ids.split(",");

    if (typeof subscribe == "string") {
        switch (subscribe) {
            case "yes":
                sessionIds.forEach((id) => {
                    let subscribers = userSubscriptions.get(id) ?? new Set();
                    subscribers.add(req.user.id);
                    userSubscriptions.set(id, subscribers);
                });
                break;
            case "no":
                sessionIds.forEach((id) => {
                    let subscribers = userSubscriptions.get(id) ?? new Set();
                    subscribers.delete(req.user.id);
                    userSubscriptions.set(id, subscribers);
                });
                break;
            default:
                return res.status(400).json({
                    error: true,
                    message: "Invalid 'subscribe' value",
                    code: 401
                });
        }
    }

    let userSessions = await Promise.all(
        sessionIds.map((id) => {
            return getUserSession(id);
        })
    );

    let users = userSessions.reduce((arr, user) => {
        if (user !== null) {
            arr.push({
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                color: user.color,
                offline: user.offline
            });
        }
        return arr;
    }, []);

    res.status(200).json({
        users: users
    });
});

router.get("/sync/client", async (req, res) => {
    let userSession = await getUserSession(req.user.id);

    // Get rooms
    let rooms = {};
    for (let roomname of userSession.rooms) {
        let room = await getRoom(roomname);

        rooms[roomname] = {
            name: room.name,
            description: room.description
        };
    }

    res.status(200).json({
        rooms: rooms
    });
});

router.get("/sync/memory", async (req, res) => {
    let stream = getStream(req.user.id);
    if (stream === null) return res.status(400).json({
        error: true,
        message: "Could not find an active stream",
        code: 601
    });

    let result = stream.flushMemory();

    if (!result) return res.status(400).json({
        error: true,
        message: "Stream is currently inactive",
        code: 602
    });

    res.status(200).json({
        success: true
    });
});

export default function(app) {
    streams(router);
    app.use("/api", authenticate, router);

    // Create starting room
    createRoom("wonk", "Welcome to Wonk Chat!");
    
    // Handle attachments
    app.use(attachments.router);
    attachments.clean();

    const apiRouter = express.Router();
    apiRouter.use(authenticate);
    apiRouter.use(router);

    app.use("/api", apiRouter);
    app.use(attachments.router);
}

function isValidRoomname(roomname) {
    if (typeof roomname !== "string") return false;
    if (
        roomname.length < 3 ||
        roomname.length > 16 ||
        roomname.replace(roomRegex, "").length !== 0
    )
        return false;
    return true;
}

export function getSubscribers(id) {
    return Array.from(userSubscriptions.get(id) ?? new Set());
}