import "./attachments.js";
import "./navbar.js";
import {
  lockChat,
  unlockChat,
  joinRoom,
  joinedRoomHandler
} from "./chat.js";
import { receiver, makeRequest, gatewayUrl } from "./comms.js";

export let userCache = new Map();
export let debugMode = false;
export let client = {
  currentRoom: null,
  rooms: new Map(),
  attachments: []
};

receiver.addEventListener("open", async () => {
  await syncClient();

  unlockChat();
  if (!client.rooms.has("irc")) joinRoom("irc");
});

receiver.addEventListener("close", () => {
  lockChat();
});

async function syncClient() { // TODO: handle this impossibility | this TODO has been taken care of
    let res = await makeRequest({
      method: "get",
      url: `${gatewayUrl}/sync/me`
    });
  
    if (res.status === 200) {
      if (debugMode) console.log("sync", res.data);
  
      for (let roomname in res.data.rooms) {
        let roomInfo = res.data.rooms[roomname];
        client.rooms.set(roomname, roomInfo);
        joinedRoomHandler(roomInfo);
      }
    } else {
      console.error("Error syncing client:", res.data.error);
    }
  }

receiver.addEventListener("updateUser", ({ detail }) => {
  userCache.set(detail.id, detail.data);
});

export async function getUsers(...ids) {
  let users = [];
  let unknowns = [];

  ids.forEach((id) => {
    if (userCache.has(id)) {
      users.push(userCache.get(id));
    } else {
      unknowns.push(id);
    }
  });

  if (unknowns.length > 0) {
    let usersRes = await makeRequest({
      method: "get",
      url: `${gatewayUrl}/users/?subscribe=yes&ids=${unknowns.join(",")}`
    });

    if (usersRes.status == 200) {
      usersRes.data.users.forEach((user) => {
        users.push(user);
        userCache.set(user.id, user);
      });
    }
  }

  return users;
}

// TODO: add "destroy" event for when the client cant reconnect after 5 tries and will be redirected to a something went wrong page
// TODO Complete.

let reconnectAttempts = 0; 
const MAX_RECONNECT_ATTEMPTS = 5;

receiver.addEventListener("open", async () => {
  await syncClient();

  unlockChat();
  if (!client.rooms.has("irc")) joinRoom("irc");
});

receiver.addEventListener("close", () => {
  lockChat();
  attemptReconnect();
});

function attemptReconnect() {
  reconnectAttempts++;
  if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
    // Retry reconnecting
    setTimeout(() => {
      receiver.connect();
    }, 3000); // Wait for 3 seconds before attempting reconnect
  } else {
    // Reconnect attempts exhausted, trigger "destroy" event
    receiver.dispatchEvent(new CustomEvent("destroy"));
  }
}

receiver.addEventListener("destroy", () => {
  // Redirect to "something went wrong" page or perform cleanup actions
  // e.g., window.location.href = "/something-went-wrong.html";
  console.log("Client destroyed. Something went wrong!");
});
receiver.addEventListener("refresh", () => {
  location.reload();
});
