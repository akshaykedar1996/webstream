// HomePage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom"; // ✅ updated react-router import
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  // ✅ FRIENDS LIST
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // ✅ RECOMMENDED USERS
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  // ✅ OUTGOING FRIEND REQUESTS
  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  // ✅ SEND REQUEST
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  // ✅ Store outgoing IDs
  useEffect(() => {
    const setIds = new Set();
    outgoingFriendReqs.forEach((req) => {
      if (req.recipient?.id) setIds.add(req.recipient.id);
    });
    setOutgoingRequestsIds(setIds);
  }, [outgoingFriendReqs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <div className="container mx-auto space-y-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">
            Your Friends
          </h2>

          <Link
            to="/notifications"
            className="btn btn-outline btn-primary btn-sm hover:btn-primary hover:text-white transition-all"
          >
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {/* FRIEND LIST */}
        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {friends.map((friend) => (
              <FriendCard key={`friend-${friend.id}`} friend={friend} />
            ))}
          </div>
        )}

        {/* Recommended Users */}
        <section>
          <div className="mb-6 sm:mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Meet New Learners
            </h2>
            <p className="opacity-70 text-sm">
              Discover your perfect language partner 🔥
            </p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="card bg-base-200 border border-base-300 p-6 text-center">
              <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              <p className="opacity-70">Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedUsers.map((user) => {
                const requestSent = outgoingRequestsIds.has(user.id);

                return (
                  <div
                    key={`rec-${user.id}`}
                    className="card bg-base-200 shadow-md hover:shadow-xl hover:scale-[1.02] border border-base-300 transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">

                      {/* Profile Info */}
                      <div className="flex items-center gap-4">
                        <div className="avatar size-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img src={user.profilePic} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-bold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <p className="text-xs opacity-70 flex items-center gap-1">
                              <MapPinIcon className="size-3" />
                              {user.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-primary badge-sm">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline badge-sm">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && (
                        <p className="text-sm opacity-70 leading-relaxed">{user.bio}</p>
                      )}

                      {/* Action Button */}
                      <button
                        className={`btn w-full ${
                          requestSent
                            ? "btn-disabled"
                            : "btn-primary hover:scale-[1.03] transition-all"
                        }`}
                        onClick={() => sendRequestMutation(user.id)}
                        disabled={requestSent || isPending}
                      >
                        {requestSent ? (
                          <>
                            <CheckCircleIcon className="size-4 mr-2" />
                            Request Sent
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-4 mr-2" />
                            Send Friend Request
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default HomePage;


// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useEffect, useState } from "react";
// import {
//   getOutgoingFriendReqs,
//   getRecommendedUsers,
//   getUserFriends,
//   sendFriendRequest,
// } from "../lib/api";
// import { Link } from "react-router";
// import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

// import { capitialize } from "../lib/utils";
// import FriendCard, { getLanguageFlag } from "../components/FriendCard";
// import NoFriendsFound from "../components/NoFriendsFound";

// const HomePage = () => {
//   const queryClient = useQueryClient();
//   const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

//   // ✅ FRIENDS LIST
//   const { data: friends = [], isLoading: loadingFriends } = useQuery({
//     queryKey: ["friends"],
//     queryFn: getUserFriends,
//   });

//   // ✅ RECOMMENDED USERS
//   const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
//     queryKey: ["users"],
//     queryFn: getRecommendedUsers,
//   });

//   // ✅ OUTGOING FRIEND REQUESTS
//   const { data: outgoingFriendReqs = [] } = useQuery({
//     queryKey: ["outgoingFriendReqs"],
//     queryFn: getOutgoingFriendReqs,
//   });

//   // ✅ SEND REQUEST
//   const { mutate: sendRequestMutation, isPending } = useMutation({
//     mutationFn: sendFriendRequest,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
//   });

//   // ✅ Store outgoing IDs
//   useEffect(() => {
//     const setIds = new Set();
//     outgoingFriendReqs.forEach((req) => {
//       setIds.add(req.recipient?.id);
//     });
//     setOutgoingRequestsIds(setIds);
//   }, [outgoingFriendReqs]);

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
//       <div className="container mx-auto space-y-12">

//         {/* ✅ Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//           <h2 className="text-3xl font-extrabold text-primary tracking-tight">
//             Your Friends
//           </h2>

//           <Link
//             to="/notifications"
//             className="btn btn-outline btn-primary btn-sm hover:btn-primary hover:text-white transition-all"
//           >
//             <UsersIcon className="mr-2 size-4" />
//             Friend Requests
//           </Link>
//         </div>

//         {/* ✅ FRIEND LIST */}
//         {loadingFriends ? (
//           <div className="flex justify-center py-12">
//             <span className="loading loading-spinner loading-lg text-primary" />
//           </div>
//         ) : friends.length === 0 ? (
//           <NoFriendsFound />
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {friends.map((friend) => (
//               <FriendCard key={`friend-${friend.id}`} friend={friend} />
//             ))}
//           </div>
//         )}

//         {/* ✅ Recommended Users */}
//         <section>
//           <div className="mb-6 sm:mb-8">
//             <h2 className="text-3xl font-extrabold tracking-tight">
//               Meet New Learners
//             </h2>
//             <p className="opacity-70 text-sm">
//               Discover your perfect language partner 🔥
//             </p>
//           </div>

//           {loadingUsers ? (
//             <div className="flex justify-center py-12">
//               <span className="loading loading-spinner loading-lg text-primary" />
//             </div>
//           ) : recommendedUsers.length === 0 ? (
//             <div className="card bg-base-200 border border-base-300 p-6 text-center">
//               <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
//               <p className="opacity-70">Check back later!</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {recommendedUsers.map((user) => {
//                 const requestSent = outgoingRequestsIds.has(user.id);

//                 return (
//                   <div
//                     key={`rec-${user.id}`}
//                     className="card bg-base-200 shadow-md hover:shadow-xl hover:scale-[1.02] border border-base-300 transition-all duration-300"
//                   >
//                     <div className="card-body p-5 space-y-4">

//                       {/* Profile Info */}
//                       <div className="flex items-center gap-4">
//                         <div className="avatar size-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
//                           <img src={user.profilePic} alt={user.fullName} />
//                         </div>

//                         <div>
//                           <h3 className="font-bold text-lg">{user.fullName}</h3>
//                           {user.location && (
//                             <p className="text-xs opacity-70 flex items-center gap-1">
//                               <MapPinIcon className="size-3" />
//                               {user.location}
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Languages */}
//                       <div className="flex flex-wrap gap-2">
//                         <span className="badge badge-primary badge-sm">
//                           {getLanguageFlag(user.nativeLanguage)}
//                           Native: {capitialize(user.nativeLanguage)}
//                         </span>
//                         <span className="badge badge-outline badge-sm">
//                           {getLanguageFlag(user.learningLanguage)}
//                           Learning: {capitialize(user.learningLanguage)}
//                         </span>
//                       </div>

//                       {user.bio && (
//                         <p className="text-sm opacity-70 leading-relaxed">{user.bio}</p>
//                       )}

//                       {/* Action Button */}
//                       <button
//                         className={`btn w-full ${
//                           requestSent
//                             ? "btn-disabled"
//                             : "btn-primary hover:scale-[1.03] transition-all"
//                         }`}
//                         onClick={() => sendRequestMutation(user.id)}
//                         disabled={requestSent || isPending}
//                       >
//                         {requestSent ? (
//                           <>
//                             <CheckCircleIcon className="size-4 mr-2" />
//                             Request Sent
//                           </>
//                         ) : (
//                           <>
//                             <UserPlusIcon className="size-4 mr-2" />
//                             Send Friend Request
//                           </>
//                         )}
//                       </button>

//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </section>

//       </div>
//     </div>
//   );
// };

// export default HomePage;
