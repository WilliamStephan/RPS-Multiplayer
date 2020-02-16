if (debug) {
    console.log("chat.js linked");
}

function chatGo() {
    if (authState && document.getElementById("chat-write").value.length > 0) {
        chatData = document.getElementById("chat-write").value + " -" + chatName + " (" + city + ")";
        logChat(chatData); // sends chat data to server - listener will display display data to page when seen
        document.getElementById("chat-write").value = "";
    } else {
        if (document.getElementById("chat-write").value.length > 0) {
            chatData = document.getElementById("chat-write").value + " -" + chatName + " (" + city + ")";
            chatSend(chatData);
            botChatReceive("Hey, you're not exactly an authenticated user! You can try to talk to me, but I'm not actually listening... -rpsBot");
        }
        document.getElementById("chat-write").value = "";
    }
}

function chatSend(chatData) {
    chatLines++;
    let p = document.createElement('p');
    $(p).addClass("triangle-right left")
        .html(chatData)
        .appendTo($("#chat-view"));
    $(p).attr('id', 'chat' + chatLines);
    $("p").remove('#' + 'chat' + (chatLines - chatLimit));
    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
}

function chatReceive(chatData) {
    chatLines++;
    let p = document.createElement('p');
    $(p).addClass("triangle-right right")
        .html(chatData)
        .appendTo($("#chat-view"));
    $(p).attr('id', 'chat' + chatLines);
    $("p").remove('#' + 'chat' + (chatLines - chatLimit));
    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
}

function botChatReceive(chatData) {
    chatLines++;
    let p = document.createElement('p');
    $(p).addClass("triangle-right botChat")
        .html(chatData)
        .appendTo($("#chat-view"));
    $(p).attr('id', 'chat' + chatLines);
    $("p").remove('#' + 'chat' + (chatLines - chatLimit));
    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
}

function gameChatReceive(chatData) {
    chatLines++;
    let p = document.createElement('p');
    $(p).addClass("triangle-right gameChat")
        .html(chatData)
        .appendTo($("#chat-view"));
    $(p).attr('id', 'chat' + chatLines);
    $("p").remove('#' + 'chat' + (chatLines - chatLimit));
    chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
}