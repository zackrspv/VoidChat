const navbarJoinRoomInput = document.getElementById("navbar-join-room");
const navbarJoinRoomButton = document.getElementById("navbar-join-room-button");
const navbarBars = document.getElementById("navbar-bars");
const navbarEle = document.getElementById("navbar");
export const navbarChannels = document.getElementById("navbar-channels");

import { isChildOf } from "https://butterycode.com/static/js/utils.js@1.2?min";
import { joinRoom } from "./client.js";

export function init() {
    navbarJoinRoomInput.addEventListener("keypress", ({ code, shiftKey }) => {
        if (code == "Enter" && !shiftKey) {
            join();
        }
    });
    
    navbarJoinRoomButton.addEventListener("click", () => {
        join();
    });
    
    document.addEventListener("click", ({ target }) => {
        if (!(target === navbarEle || target === navbarBars || isChildOf(target, navbarEle))) {
            navbarEle.classList.remove("pulled-out");
        }
    });

    navbarBars.addEventListener("click", () => {
        navbarEle.classList.add("pulled-out");
    });

    window.addEventListener("resize", () => {
        navbarEle.classList.remove("pulled-out");
    });
}

function join() {
    var room = navbarJoinRoomInput.value;
    navbarJoinRoomInput.value = "";

    joinRoom(room);
}

