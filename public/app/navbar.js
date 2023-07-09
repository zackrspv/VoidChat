const navbarJoinRoomInput = document.getElementById("navbar-join-room");
const navbarJoinRoomButton = document.getElementById("navbar-join-room-button");
const navbarBars = document.getElementById("navbar-bars");
const navbarEle = document.getElementById("navbar");
const navbarChannels = document.getElementById("navbar-channels");
const appEle = document.getElementById("app");

import { isChildOf } from "https://butterycode.com/static/js/utils.js@1.2";
import { joinRoom, leaveRoom, switchRooms } from "./chat.js";

navbarJoinRoomInput.addEventListener("keypress", ({ code }) => {
    if (code == "Enter") {
        join();
    }
});

navbarJoinRoomButton.addEventListener("click", () => {
    join();
});

document.addEventListener("click", ({ target }) => {
    if (!(target === navbarEle || target === navbarBars || isChildOf(target, navbarEle))) {
        navbarEle.classList.remove("pulled-out");
        appEle.classList.remove("backdrop");
    }
});

navbarBars.addEventListener("click", () => {
    navbarEle.classList.add("pulled-out");
    appEle.classList.add("backdrop");
});

window.addEventListener("resize", () => {
    navbarEle.classList.remove("pulled-out");
    appEle.classList.remove("backdrop");
});

function join() {
    let roomname = navbarJoinRoomInput.value;

    if (
        roomname.length < 3 ||
        roomname.length > 16 ||
        roomname.replace(/[a-z0-9_]*/g, '').length !== 0
    ) return;

    navbarJoinRoomInput.value = "";

    joinRoom(roomname);
}

export function addNavbarChannel(roomname) {
    let chanEle = document.createElement("div");
    chanEle.setAttribute("room", roomname);
    chanEle.classList.add("navbar-channel");

    let tagEle = document.createElement("img");
    tagEle.classList.add("no-select", "no-drag", "room-tag");
    tagEle.src = "/icons/hashtag-solid.svg";
    chanEle.appendChild(tagEle);

    let nameEle = document.createElement("span");
    nameEle.classList.add("room-name");
    nameEle.innerText = `${roomname}`;
    chanEle.appendChild(nameEle);

    let closeEle = document.createElement("img");
    closeEle.classList.add("no-select", "no-drag", "room-close");
    closeEle.src = "/icons/xmark-solid.svg";
    closeEle.addEventListener("click", () => {
        leaveRoom(roomname);
    });
    chanEle.appendChild(closeEle);

    chanEle.addEventListener("click", ({ target }) => {
        if (target === closeEle) return;
        switchRooms(roomname);
    });

    navbarChannels.appendChild(chanEle);
}

export function getNavbarChannel(roomname) {
    return navbarChannels.querySelector(`.navbar-channel[room="${roomname}"]`);
}

export function getAllNavbarChannels() {
    return navbarChannels.querySelectorAll(".navbar-channel");
}
