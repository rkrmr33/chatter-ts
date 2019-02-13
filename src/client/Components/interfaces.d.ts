declare enum Routes{
  MAIN = 0,
  CHAT_ROOM = 1,
  SIGN_UP = 2,
  LOG_IN = 3
}

interface IAppState {
  display : Routes;
  chatRooms? : any;
  currentChat? : IChat | null;
  user? : IUser | undefined;
  messages? : Array<IMessage> | undefined;
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
  users : Array<IUser>;
}

interface IUser {
  _id? : string;
  firstName? : string;
  lastName? : string;
  email? : string;
  username : string;
  password? : string;
  specialColor? : string;
  avatar? : string;
  votes? : number;
  cp? : number;
}

interface IMessage {
  _id? : string;
  chatId : string;
  user : IUser;
  body : string;
  votes : Array<IUser>;
  timestamp : string;
}

interface IChatListProps {
  onChatClick(chatId : string) : void;
  chatList : any;
}

interface IChatListState {
  chatList : any;
}

interface IChatPreview {
  key : string;
  onChatClick(chatId : string) : void;
  chat : IChat;
}

interface IChatRoomProps {
  chat? : IChat | null;
  user? : IUser;
  users? : Array<IUser>;
  messages? : Array<IMessage>;
  goToLogin() : void;
  goToSignup() : void;
}

interface IChatRoomState {
  users? : Array<IUser>;
  messages? : Array<IMessage>;
  loading? : boolean;
}

interface ISignupProps {
  login(credentials:any) : any;
  goToLogin() : void;
  goToChatter() : void;
}

interface ISignupState {
  firstName : string;
  lastName : string;
  email : string;
  username : string;
  password1 : string;
  password2 : string;
  formErrors : IFormErrors;
}

interface IFormErrors {
  firstName : string;
  lastName : string;
  email : string;
  username : string;
  password1 : string;
  password2 : string;
  [key:string]:string;
}

interface ILoginProps {
  login(credentials:any) : any;
  goToSignup() : void;
  goToChatter() : void;
}

interface ILoginState {
  errors: {
    username:string,
    password:string,
    result:string
  }
}