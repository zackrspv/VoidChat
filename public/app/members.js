const membersShow = document.getElementById("members-show");
const membersWrapper = document.getElementById("members-wrapper");

export let members = new Map(); // TODO: cache members

import {
    client
} from "./client.js";

import { receiver } from "./comms.js";

tippy(membersShow, {
    content: 'Toggle Member List'
});

membersShow.addEventListener("click", () => {
    membersWrapper.classList.toggle("hidden");
});

receiver.addEventListener("updateMember", ({ detail }) => {
    console.log("updateMember", detail);

    // TODO: update member on member list
});

export function setMembers(roomname, members) {
    console.log("setMembers", members);

    let membersContainer = getMembersContainer(roomname);
    
    while (membersContainer.firstChild) {
        membersContainer.removeChild(membersContainer.firstChild);
    }

    members.forEach(user => {
        if (user.new) {
            var newEle = document.createElement("div");

            var nameEle = document.createElement("span");
            nameEle.innerText = `${user.username}`;
            nameEle.style.color = user.color;
            newEle.appendChild(nameEle);
        
            var contEle = document.createElement("span");
            contEle.innerText = " has joined the chat";
            contEle.style.color = "rgba(255, 255, 255, 0.6)";
            newEle.appendChild(contEle);
        
            addChatElement(newEle, roomname);
        } else if (user.left) {
            var leftEle = document.createElement("div");

            var nameEle = document.createElement("span");
            nameEle.innerText = `${user.username}`;
            nameEle.style.color = user.color;
            leftEle.appendChild(nameEle);
        
            var contEle = document.createElement("span");
            contEle.innerText = " has left the chat";
            contEle.style.color = "rgba(255, 255, 255, 0.6)";
            leftEle.appendChild(contEle);

            addChatElement(leftEle, roomname);
            return; // Cancel adding member to member list
        }

        var memEle = document.createElement("div");

        var nameEle = document.createElement("span");
        nameEle.innerText = `${user.username}`;
        nameEle.style.color = user.color;
        memEle.appendChild(nameEle);

        var discEle = document.createElement("span");
        discEle.innerText = `#${user.discriminator}`;
        discEle.style.color = "rgba(255, 255, 255, 0.2)";
        memEle.appendChild(discEle);
    
        membersContainer.appendChild(memEle);
    });
};

export function getMembersContainer(roomname = null) {
    return membersWrapper.querySelector(`.members-container[room="${roomname === null ? client.currentRoom : roomname}"]`);
}
