import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export function ChatDashboard() {
  const history = useHistory();

  const [users, setUsers] = useState([]);
  const userInfoData = localStorage.getItem("userInfo");
  const userInfoObject = JSON.parse(userInfoData);
  const logged_user_id = userInfoObject.user_id[0].user_id;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/id/allchats/?loggeduserid=${logged_user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch users");
          return;
        }

        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleChatClick = (userId) => {
    history.push(`/chat/${userId}`);
  };

  return (
    <div className="chat-dashboard">
      <h1>Chat Dashboard</h1>
      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.other_user_id}
            className="user"
            onClick={() => handleChatClick(user.other_user_id)}
          >
            <p>{user.other_user_id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatDashboard;
