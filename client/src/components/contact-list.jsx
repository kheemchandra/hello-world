import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    selectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contact");
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer
        
        ${
          selectedChatData && selectedChatData._id === contact._id
            ? "bg-[#8417ff] hover:bg-[#8417ff]"
            : "hover:bg-[#f1f1f111]"
        }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10  rounded-full overflow-hidden">
                {contact.image ? (
                  <AvatarImage
                    src={`${HOST}/${contact.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`
 
${
  selectedChatData && selectedChatData._id === contact._id
    ? "bg-[ffffff22] border border-white/70"
    : getColor(contact.color)
}
 
uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                  >
                    {contact.firstName
                      ? contact.firstName.split("").shift()
                      : contact.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <div className="flex flex-col">
                <span className="font-medium text-neutral-200">
                  {contact.name}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3 h-3"
                    fill="currentColor"
                  >
                    <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm18 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8-4c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
                  </svg>
                  {contact.members.length + 1}{" "}
                  {contact.members.length + 1 === 1 ? "member" : "members"}
                </span>
              </div>
            ) : (
              <span>
                {contact.firstName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.email}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
