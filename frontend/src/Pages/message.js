import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useHistory } from "react-router-dom";
import { Button } from "@chakra-ui/react";

export function Chat({ socket, username, room, sender_id }) {
  const history = useHistory();
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        chat_id: room,
        senderId: sender_id,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData, () => {
        setMessageList((list) => [...list, messageData]);
      });
      setCurrentMessage("");
    }
  };
  const logoutHandler = async () => {
    const response = await fetch(
      `http://localhost:5000/auth/logout/?user=${sender_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  useEffect(() => {
    socket.on("chat_history", (history) => {
      setMessageList(history);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.returnValue = "Are you sure you want to leave?";
      logoutHandler();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
      <Button colorScheme="blue" onClick={logoutHandler}>
        Logout
      </Button>
    </div>
  );
}

export default Chat;
