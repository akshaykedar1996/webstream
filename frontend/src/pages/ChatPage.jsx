// ChatPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

// ✅ Stream API Key from env
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  // ✅ Fetch Stream Token
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // only when logged in
  });

  useEffect(() => {
    const initChat = async () => {
      // check for token, authUser and targetUserId
      if (!tokenData?.token || !authUser || !targetUserId) return;

      try {
        console.log("Initializing stream chat client...");

        // ✅ Step 4: Initialize Stream Chat Client
        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Connect User
        await client.connectUser(
          {
            id: authUser.id.toString(), // must match user_id in token
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        // ✅ Step 5: Setup Channel
        const channelId = [authUser.id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser.id.toString(), targetUserId.toString()],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);

        // check if token expired / API key invalid
        if (error.message.includes("api_key not valid")) {
          toast.error("Stream API Key invalid. Check your VITE_STREAM_API_KEY.");
        } else if (error.message.includes("userToken does not have a user_id")) {
          toast.error("Token does not match logged-in user. Login again.");
        } else {
          toast.error("Could not connect to chat. Please try again.");
        }

        // redirect if targetUserId missing
        if (!targetUserId) {
          toast.error("Invalid chat URL. Redirecting to dashboard.");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // ✅ Cleanup on unmount
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [tokenData, authUser, targetUserId]);

  // ✅ Video Call Button
  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;


// import { useEffect, useState } from "react";
// import { useParams } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import { useQuery } from "@tanstack/react-query";
// import { getStreamToken } from "../lib/api";

// import {
//   Channel,
//   ChannelHeader,
//   Chat,
//   MessageInput,
//   MessageList,
//   Thread,
//   Window,
// } from "stream-chat-react";
// import { StreamChat } from "stream-chat";
// import toast from "react-hot-toast";

// import ChatLoader from "../components/ChatLoader";
// import CallButton from "../components/CallButton";

// const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// const ChatPage = () => {
//   const { id: targetUserId } = useParams();

//   const [chatClient, setChatClient] = useState(null);
//   const [channel, setChannel] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const { authUser } = useAuthUser();

//   const { data: tokenData } = useQuery({
//     queryKey: ["streamToken"],
//     queryFn: getStreamToken,
//     enabled: !!authUser, // this will run only when authUser is available
//   });

// useEffect(() => {
//   const initChat = async () => {
//     if (!tokenData?.token || !authUser || !targetUserId) return;

//     try {
//       console.log("Initializing stream chat client...");

//       // ✅ Step 4: Initialize Stream Chat Client
//       const client = StreamChat.getInstance(STREAM_API_KEY);

//       // Connect User
//       await client.connectUser(
//         {
//           id: authUser.id.toString(),   // must match user_id in token
//           name: authUser.fullName,
//           image: authUser.profilePic,
//         },
//         tokenData.token
//       );

//       // Setup channel
//       const channelId = [authUser.id, targetUserId].sort().join("-");
//       const currChannel = client.channel("messaging", channelId, {
//         members: [authUser.id.toString(), targetUserId.toString()],
//       });

//       await currChannel.watch();

//       setChatClient(client);
//       setChannel(currChannel);
//     } catch (error) {
//       console.error("Error initializing chat:", error);
//       toast.error("Could not connect to chat. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   initChat();
// }, [tokenData, authUser, targetUserId]);


//   const handleVideoCall = () => {
//     if (channel) {
//       const callUrl = `${window.location.origin}/call/${channel.id}`;

//       channel.sendMessage({
//         text: `I've started a video call. Join me here: ${callUrl}`,
//       });

//       toast.success("Video call link sent successfully!");
//     }
//   };

//   if (loading || !chatClient || !channel) return <ChatLoader />;

//   return (
//     <div className="h-[93vh]">
//       <Chat client={chatClient}>
//         <Channel channel={channel}>
//           <div className="w-full relative">
//             <CallButton handleVideoCall={handleVideoCall} />
//             <Window>
//               <ChannelHeader />
//               <MessageList />
//               <MessageInput focus />
//             </Window>
//           </div>
//           <Thread />
//         </Channel>
//       </Chat>
//     </div>
//   );
// };
// export default ChatPage;
