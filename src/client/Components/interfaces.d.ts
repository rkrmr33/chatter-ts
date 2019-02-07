interface IApp {
  display : string;
  chatRooms? : IChat;
  user? : IUser;
}

interface IHeader {
  user? : IUser;
  goToChatter() : void;
  goToLogin() : void;
  goToSignup() : void;
  logout() : void;
}

interface IChat {
  _id : string;
  chatOwner : string;
  chatName : string;
  chatDescription : string;
  chatImage : string;
  users : Array<string>;
}

interface IUser {
  _id : string;
  firstName : string;
  lastName : string;
  email : string;
  username : string;
  password : string;
  specialColor : string;
}

interface IChatList {
  onChatClick(chatId : string) : void;
  chatList : any;
}

interface IChatPreview {
  key : string;
  onChatClick(chatId : string) : void;
  chat : IChat;
}