import { useParams } from "react-router-dom";
import ChatPage from "./ChatPage.jsx";

const ChatPageWrapper = () => {
  const { id } = useParams(); // this is target user id
  return <ChatPage targetUserId={id} />;
};

export default ChatPageWrapper;
