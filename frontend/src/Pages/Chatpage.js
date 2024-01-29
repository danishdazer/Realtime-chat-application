import React, { useState, useEffect } from "react";
import { Button, Input, Box, Heading, Text, Flex } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import Chat from "./message";
const socket = io.connect("http://localhost:5000");

const Chatpage = () => {
  const history = useHistory();

  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [ChatId, setChatId] = useState("");
  const [name, setname] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [showCreateChatButton, setShowCreateChatButton] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    setShowCreateChatButton(false);
  };
  const userInfoData = localStorage.getItem("userInfo");
  const userInfoObject = JSON.parse(userInfoData);
  const logged_user_id = userInfoObject.user_id[0].user_id;
  const handleLogin = async () => {
    try {
      socket.emit("login", { logged_user_id });
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  handleLogin();
  const handleUserNameClick = async () => {
    try {
      const userid = searchResult[0].user_id;
      const response = await fetch(
        `http://localhost:5000/id/user/?user=${userid}&loggeduserid=${logged_user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const chatDetails = await response.json();
      setChatId(chatDetails.chatId);

      const temp = await fetch(
        `http://localhost:5000/auth/status/?user=${userid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const helper = await temp.json();
      const status = helper.is_online === 1 ? "online" : "offline";
      setStatus(status);
    } catch (error) {
      console.error("Error fetching chat details:", error.message);
    }
    setShowCreateChatButton(true);
  };

  const handleCreateChatClick = () => {
    socket.emit("join_room", ChatId);
    setShowChat(true);
  };

  useEffect(() => {
    setStatus(null);
    const userInfoString = localStorage.getItem("userInfo");
    if (userInfoString != null) {
      const userInfoObject = JSON.parse(userInfoString);
      const temp = userInfoObject.namen[0].name;
      if (temp) {
        setname(temp);
      }
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/auth/user/${searchInput}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Error fetching user data");
          }
          return;
        }

        const data = await response.json();
        setSearchResult(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching user data");
      }
    };

    fetchData();
  }, [searchInput]);

  const logoutHandler = async () => {
    const response = await fetch(
      `http://localhost:5000/auth/logout/?user=${logged_user_id}`,
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
    <div className="App">
      {!showChat ? (
        <Box p={4} maxW="600px" mx="auto">
          <Flex justify="space-between" align="center" mb={4}>
            <Input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={handleSearchInputChange}
              width="70%"
            />
            <Button colorScheme="blue" onClick={logoutHandler}>
              Logout
            </Button>
          </Flex>

          {error && <Text color="red.500">{error}</Text>}

          {searchResult.length > 0 && (
            <Box mt={4}>
              <Heading size="md">User Name</Heading>
              <Text
                onClick={handleUserNameClick}
                cursor="pointer"
                color="blue.500"
              >
                {searchResult[0].name}{" "}
                {status && (
                  <Text
                    as="span"
                    color={status === "online" ? "green.500" : "red.500"}
                  >
                    ({status})
                  </Text>
                )}
              </Text>

              {showCreateChatButton && (
                <Button
                  mt={2}
                  onClick={handleCreateChatClick}
                  colorScheme="green"
                >
                  Start Chat
                </Button>
              )}
            </Box>
          )}
        </Box>
      ) : (
        <Chat
          socket={socket}
          username={name}
          room={ChatId}
          sender_id={logged_user_id}
        />
      )}
    </div>
  );
};

export default Chatpage;
