const APIKEY = '';
const URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = "gpt-3.5-turbo";
const MAX_TOKENS = 50;
let NEXT_ID = 0 ;
let CURREND_ID_SELECTED = 0;

const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const chatListDiv = document.getElementById('chat-list')
const addChatButton = document.querySelector('#add-chat-button')

// Event listener to setting up the next id for the next option value
document.addEventListener("DOMContentLoaded", () => {
    const existChat = JSON.parse(localStorage.getItem('conversations'))
    if(existChat){
        // Checking the bigger id and adding 1 for the next option value
        for(const id in existChat){
            if(existChat.hasOwnProperty(id)){
                if(id > NEXT_ID){
                    NEXT_ID = id;
                } else if (id == NEXT_ID) {
                    NEXT_ID += 1;
                }
            }
        }
        // Loading the actual conversation
        loadConversation(CURREND_ID_SELECTED)
    }
});

// sendMessage: Function how manage user input
const sendMessage = () => {
    const optionSelect = document.querySelector('.option-chat')

    // Validating user input
    const message = userInput.value.trim();
    if (message === '') return;

    // cheching if a chat exist if not adding new one
    if(!optionSelect){ addNewChat() }

    // Adding message to DOM, saving the user message into LocalStorage and getting the response
    addUserMessage(message);
    saveMessageInLocalstorage('user', message, CURREND_ID_SELECTED)
    getResponse(CURREND_ID_SELECTED);
    userInput.value = '';
}

// clearChat: Function to clear chat located on the Local Storage
const clearChat = () => {
    localStorage.clear()
    // Reloading the page
    location.reload()
}

// addNewChat: Funtion who handle new chats
const addNewChat = () => {
    chatMessages.innerHTML = 'Enter a new conversation...';
    createOption(NEXT_ID);
    NEXT_ID += 1;
    loadChats();
}

// addUserMessage: Function to add user message in DOM
const addUserMessage = (message) => {
  const messageElement = document.createElement('div');
  messageElement.className = 'user-message';
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// addBotMessage: Function to add assistant message in DOM
const addBotMessage = (message) => {
  const messageElement = document.createElement('div');
  const formattedText = message.replace(/\n/g, "<br>").replace(/```([\s\S]*?)```/g, '<code>$1</code>');;
  messageElement.className = 'chatbot-message';
  messageElement.innerHTML = formattedText;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

const addLoadingDiv = () => {
    const messageElement = document.createElement('div');
    const loader = document.createElement('span');
    loader.className = 'loader'
    messageElement.className = 'chatbot-message';
    messageElement.appendChild(loader)
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// getReponse: function to fetch OpenAI API
// URL: OPENAI api endpoint
// Model: current model to use
// Max_tokens: numbers of max token (words)
const getResponse = (id) => {
    const messages = JSON.parse(localStorage.getItem('conversations'))[id] || {}
    addLoadingDiv()

    fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${APIKEY}`,
        },
        body: JSON.stringify({
            messages: messages,
            model: MODEL,
        }),
    })
    .then(response => response.json()) // Parsing the data to JS format
    .then(data => {
        const chatbotResponse = data.choices[0].message.content;
        // If we get the correct data, we save it and display it
        if( chatbotResponse ){
            // Removing the loader
            let loader = document.querySelectorAll('.chatbot-message')
            loader = loader[loader.length - 1]
            console.log(loader)
            loader.remove()

            addBotMessage(chatbotResponse);
            saveMessageInLocalstorage('assistant', chatbotResponse, CURREND_ID_SELECTED)
            
        } else {
            console.log('Error on bot response')
        }

    })
    .catch(error => console.error(error));
    }

// loadChats: Function to load conversation from localstorage and create options for those chats
const loadChats = () => {
    const conversations = JSON.parse(localStorage.getItem('conversations')) || {}
    const options = document.querySelectorAll('.option-chat')
    for (const id in conversations) {
        // Validating if the option alredy exist on the select list
        if(!Array.from(options).some(option => option.value == id)){
            createOption(id);
        }
    }
}

// loadConversation: Function to get the actual conversation from the localstorage
const loadConversation = (input_id) => {
    for (let i = 0; i < chatListDiv.children.length; i++) {
        if(i == input_id){
            const child = chatListDiv.children[input_id];
            child.classList.add('active')
        } else{
            chatListDiv.children[i].classList.remove('active')
        }

        
    }

    CURREND_ID_SELECTED = input_id;
    const id = parseInt(input_id);
    if(id == NaN){ return }

    const chat = JSON.parse(localStorage.getItem('conversations'));
    if(chat){
        let conversation = chat[id]
        if(!conversation){ // Validating if the conversation chat exist on the localstorage
            return chatMessages.innerHTML = 'Enter a new conversation...'
        }
        chatMessages.innerHTML = '';
        conversation.forEach(msg => { // Adding the conversation to the DOM
            if(msg.role == 'user'){
                addUserMessage(msg.content)
            } else if(msg.role == 'assistant'){
                addBotMessage(msg.content)
            }
        })
    } else {
        chatMessages.innerHTML = 'Enter a new conversation...'
    }
}

// saveMessageInLocalstorage: Function to save the message from user or bot
const saveMessageInLocalstorage = (role, content, id) => {
  const chat = JSON.parse(localStorage.getItem('conversations')) || {};
  // Validationg if the id exist on localstorage, if not, create a new object
  if( !chat[id]){ 
    chat[id] = [];
  }
  chat[id].push({ role, content }); // Adding the object
  localStorage.setItem('conversations', JSON.stringify(chat)); // Saving the object in JSON format

}

// createOption: Function to create options with the values into the select 
const createOption = (id) => {
    const optionElement = document.createElement('div');
    const imageElement = document.createElement('img');
    imageElement.src = './static/img/icons/chat.png';
    optionElement.value = id;
    optionElement.textContent = `Chat ${parseInt(id)+1}`
    optionElement.classList.add('option-chat')
    console.log(id)
    optionElement.appendChild(imageElement)
    optionElement.addEventListener('click', () => loadConversation(id))
    chatListDiv.appendChild(optionElement)
}

// Loading initial chats
loadChats();
// EventListeners
// chatListDiv.addEventListener('click', loadConversation);
userInput.addEventListener('keydown', e => {
    if(e.key == 'Enter' && !e.shiftKey){
        e.preventDefault()
        sendMessage()
    }
})
sendButton.addEventListener('click', sendMessage);
clearButton.addEventListener('click', clearChat)
addChatButton.addEventListener('click', addNewChat)

