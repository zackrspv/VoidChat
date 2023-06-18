import { isNil, dom, domParser } from "https://butterycode.com/static/js/utils.js@1.2";

export function chatMessage(username, color, discriminator, content, timestamp) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
  
    if (timestamp !== null && timestamp !== undefined) {
      const timestampElement = timestampComponent(timestamp);
      messageContainer.appendChild(timestampElement);
    }
  
    const userDisplayElement = userDisplay(username, color, discriminator);
    messageContainer.appendChild(userDisplayElement);
  
    const contentElement = document.createElement("span");
    contentElement.classList.add("content");
    contentElement.innerText = content;
    messageContainer.appendChild(contentElement);
  
    return messageContainer;
  }

export function userDisplay(username, color, discriminator = null, stayVisible = false) {
    let userEle = document.createElement("div");

    let nameEle = document.createElement("span");
    nameEle.classList.add("username");
    nameEle.innerText = `${username}`;
    nameEle.style.color = color;
    userEle.appendChild(nameEle);

    if (!isNil(discriminator)) {
        let discEle = document.createElement("span");
        discEle.classList.add("discriminator");
        if (stayVisible) discEle.classList.add("stay-visible");
        discEle.innerText = "#" + `00${discriminator}`.slice(-2);
        userEle.appendChild(discEle);
    }

    return userEle;
}

export function timestampComponent(timestamp) {
    let date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    let time = date.toLocaleTimeString("en-us", {
        hour: "numeric",
        minute: "numeric"
    });

    let dateTime = `${date.toLocaleDateString("en-us", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })}, ${date.toLocaleTimeString("en-us", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    })}`;

    let timeEle = document.createElement("span");
    timeEle.classList.add("timestamp");
    timeEle.innerText = time;

    tippy(timeEle, {
        content: dateTime
    });

    return timeEle;
}
