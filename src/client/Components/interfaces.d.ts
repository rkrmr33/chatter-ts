declare enum Routes{
  MAIN = 0,
  CHAT_ROOM = 1,
  SIGN_UP = 2,
  LOG_IN = 3,
  CHAT_CREATION = 4
}

interface IAppState {
  display : Routes;
  chatRooms? : any;
  currentChat? : IChat | null;
  user? : IUser | undefined;
  messages? : Array<IMessage> | undefined;
}


interface IHeader {
  display? : Routes;
  user? : IUser;
  goToChatter() : void;
  goToChatCreation() : void;
  goToLogin() : void;
  goToSignup() : void;
  logout() : void;
}

interface IChat {
  _id? : string;
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
  chatId? : string;
  user : IUser;
  body : string;
  votes : Array<string>;
  timestamp : string;
}

interface IMessageProps {
  message: IMessage;
  currentUser: IUser | undefined;
  voteMessage(message : IMessage | undefined) : void;
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
  messages? : any;
  goToLogin() : void;
  goToSignup() : void;
}

interface IChatRoomState {
  users? : Array<IUser>;
  messages? : any;
  loading? : boolean;
}

interface ISignupProps {
  login(credentials:any) : any;
  goToLogin() : void;
  goToChatter() : void;
  user : IUser | undefined;
}

interface ISignupState {
  firstName : string;
  lastName : string;
  email : string;
  username : string;
  password1 : string;
  password2 : string;
  formErrors : ISignupFormErrors;
}

interface ISignupFormErrors {
  firstName : string;
  lastName : string;
  email : string;
  username : string;
  password1 : string;
  password2 : string;
  [key:string]:string;
}


interface IChatCreationProps {
  goToChatter() : void;
  user : IUser | undefined;
}

interface IChatCreationState {
  chatName: string;
  chatDescription: string;
  chatImageUrl : string;
  formErrors : IChatCreationFormErrors
  resultMsg : string;
  notEnoughCP: string;
}

interface IChatCreationFormErrors {
  chatName : string;
  chatDescription : string;
  [key:string]:string;
}

interface ILoginProps {
  login(credentials:any) : any;
  goToSignup() : void;
  goToChatter() : void;
  user : IUser | undefined;
}

interface ILoginState {
  errors: {
    username:string,
    password:string,
    result:string
  }
}