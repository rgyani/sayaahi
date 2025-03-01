import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import "./styles.min.css";
import {
    BasicStorage,
    ChatMessage,
    ChatProvider,
    Conversation,
    ConversationId,
    ConversationRole,
    IStorage,
    MessageContentType,
    Participant,
    Presence,
    TypingUsersList,
    UpdateState,
    User,
    UserStatus
} from "@chatscope/use-chat";
import {ExampleChatService} from "@chatscope/use-chat/dist/examples";
import {Chat} from "./components/Chat";
import {nanoid} from "nanoid";
import {Col, Container, Row} from "react-bootstrap";
import {meModel, users} from "./data/data";
import {AutoDraft} from "@chatscope/use-chat/dist/enums/AutoDraft";
import { getConversation, hasConversation } from "./storage/LocalStorageHelper";
 
// sendMessage and addMessage methods can automagically generate id for messages and groups
// This allows you to omit doing this manually, but you need to provide a message generator
// The message id generator is a function that receives message and returns id for this message
// The group id generator is a function that returns string
const messageIdGenerator = (message: ChatMessage<MessageContentType>) => nanoid();
const groupIdGenerator = () => nanoid();


// Create serviceFactory
const serviceFactory = (storage: IStorage, updateState: UpdateState) => {
    return new ExampleChatService(storage, updateState);
};


function createConversation(id: ConversationId, name: string): Conversation {
    return new Conversation({
        id,
        participants: [
            new Participant({
                id: name,
                role: new ConversationRole([])
            })
        ],
        unreadCounter: 0,
        typingUsers: new TypingUsersList({items: []}),
        draft: ""
    });
}


const chatStorage = new BasicStorage({groupIdGenerator, messageIdGenerator});
users.forEach(u => {
    chatStorage.addUser(new User({
            id: u.name,
            presence: new Presence({status: UserStatus.Available}),
            firstName: u.prompt,
            lastName: u.results.toString(),
            username: u.name,
            email: "",
            avatar: u.avatar,
            bio: u.info
        }));

    
    const conversationId = u.name;

    var myConversation = chatStorage.getState().conversations.find(cv => typeof cv.participants.find(p => p.id === u.name) !== "undefined");
    if (!myConversation) {
        chatStorage.addConversation(createConversation(conversationId, u.name));
    }

    if(hasConversation(u.name))
        getConversation(u.name).forEach((c: ChatMessage<MessageContentType>) => {
            return chatStorage.addMessage(c, conversationId, true);
        })

});

const me = new User({
    id: "Me",
    presence: new Presence({status: UserStatus.Available, description: ""}),
    firstName: "",
    lastName: "",
    username: "ME",
    email: "",
    avatar: meModel.avatar,
    bio: ""
});
function App() {

    return (
        <div className="h-100 d-flex flex-column overflow-hidden">
            <Container fluid className="p-4 flex-grow-1 position-relative overflow-hidden">
                <Row className="h-100 pb-1 flex-nowrap">
                    <Col>
                        <ChatProvider serviceFactory={serviceFactory} storage={chatStorage} config={{
                            typingThrottleTime: 250,
                            typingDebounceTime: 900,
                            debounceTyping: true,
                            autoDraft: AutoDraft.Save | AutoDraft.Restore
                        }}>
                            <Chat user={me}/>
                        </ChatProvider>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
