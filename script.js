// DOM Elements
const configPanel = document.getElementById('configPanel');
const toggleConfigBtn = document.getElementById('toggleConfig');
const cancelConfigBtn = document.getElementById('cancelConfig');
const applyConfigBtn = document.getElementById('applyConfig');
const toggleMobileModeBtn = document.getElementById('toggleMobileMode');
const toggleThemeBtn = document.getElementById('toggleTheme');
const chatContainer = document.getElementById('chatContainer');
const chatList = document.getElementById('chatList');
const conversationPanel = document.getElementById('conversationPanel');
const chatItems = document.getElementById('chatItems');
const mainChatItem = document.getElementById('mainChatItem');
const backButton = document.getElementById('backButton'); // Mobile back from conversation
const backToListButton = document.getElementById('backToList'); // Mobile back bar (unused in current CSS)
const addContactBtn = document.getElementById('addContactBtn');
const otherContacts = document.getElementById('otherContacts');
const desktopModeRadio = document.getElementById('desktopMode');
const mobileModeRadio = document.getElementById('mobileMode');
const lightModeRadio = document.getElementById('lightMode');
const darkModeRadio = document.getElementById('darkMode');

// Configuration Inputs
const senderNameInput = document.getElementById('senderName');
const senderPicInput = document.getElementById('senderPic');
const receiverNameInput = document.getElementById('receiverName');
const receiverPicInput = document.getElementById('receiverPic');
const receiverTitleInput = document.getElementById('receiverTitle');
const jsonDataInput = document.getElementById('jsonData');

// UI Elements to Update
const receiverAvatarSidebar = document.getElementById('receiverAvatarSidebar');
const receiverNameSidebar = document.getElementById('receiverNameSidebar');
const receiverAvatarHeader = document.getElementById('receiverAvatarHeader');
const receiverNameHeader = document.getElementById('receiverNameHeader');
const receiverTitleHeader = document.getElementById('receiverTitleHeader');
const messagesContainer = document.getElementById('messagesContainer');

// --- Configuration Panel Logic ---

function toggleConfigPanel() {
    if (configPanel.style.display === 'block') {
        configPanel.style.display = 'none';
    } else {
        configPanel.style.display = 'block';
    }
}

function hideConfigPanel() {
    configPanel.style.display = 'none';
}

function applyConfiguration() {
    console.log("Applying configuration...");

    // 1. Get values from config inputs
    const senderName = senderNameInput.value;
    const senderPic = senderPicInput.value;
    const receiverName = receiverNameInput.value;
    const receiverPic = receiverPicInput.value;
    const receiverTitle = receiverTitleInput.value;

    // 2. Update Receiver UI elements
    updateReceiverUI(receiverName, receiverPic, receiverTitle);

    // 3. Update Other Contacts in Sidebar
    updateChatList(receiverName, receiverPic);

    // 4. Parse and Render Messages
    try {
        const messagesData = JSON.parse(jsonDataInput.value);
        if (!Array.isArray(messagesData)) {
            throw new Error("JSON data must be an array.");
        }
        renderMessages(messagesData, senderName, senderPic, receiverName, receiverPic);
        // Update last message preview for main contact
        const lastMessage = messagesData.length > 0 ? messagesData[messagesData.length - 1].message : "No messages yet";
        const lastTime = messagesData.length > 0 ? messagesData[messagesData.length - 1].time : "";
        mainChatItem.querySelector('.chat-preview').textContent = lastMessage.length > 30 ? lastMessage.substring(0, 27) + '...' : lastMessage;
        mainChatItem.querySelector('.chat-time').textContent = lastTime;

    } catch (error) {
        alert(`Error parsing JSON data: ${error.message}\nPlease check the format.`);
        console.error("JSON Parsing Error:", error);
        // Optionally clear messages or show an error state
        messagesContainer.innerHTML = '<p style="text-align: center; color: red;">Error loading messages. Check JSON format.</p>';
    }

    // 5. Apply Display Mode
    const selectedDisplayMode = document.querySelector('input[name="displayMode"]:checked').value;
    setDisplayMode(selectedDisplayMode);

    // 6. Apply Theme
    const selectedTheme = document.querySelector('input[name="themeMode"]:checked').value;
    setTheme(selectedTheme);

    // 7. Hide Config Panel
    hideConfigPanel();
    console.log("Configuration applied.");
}

function updateReceiverUI(name, picUrl, title) {
    receiverNameSidebar.textContent = name;
    receiverAvatarSidebar.src = picUrl;
    receiverAvatarSidebar.alt = name;

    receiverNameHeader.textContent = name;
    receiverAvatarHeader.src = picUrl;
    receiverAvatarHeader.alt = name;
    receiverTitleHeader.textContent = title;
}

function updateChatList(mainReceiverName, mainReceiverPic) {
    // Update main chat item details (already partially done in applyConfiguration)
    mainChatItem.querySelector('.chat-name').textContent = mainReceiverName;
    mainChatItem.querySelector('.avatar').src = mainReceiverPic;

    // Clear existing other contacts (keep the main one)
    const existingOtherContacts = chatItems.querySelectorAll('.chat-item:not(#mainChatItem)');
    existingOtherContacts.forEach(item => item.remove());

    // Get other contact data from config panel
    const otherContactElements = otherContacts.querySelectorAll('.other-contact');
    otherContactElements.forEach((contactDiv, index) => {
        const name = contactDiv.querySelector('.contact-name').value;
        const pic = contactDiv.querySelector('.contact-pic').value;
        const message = contactDiv.querySelector('.contact-message').value;
        const time = contactDiv.querySelector('.contact-time').value;

        if (name && pic) { // Only add if name and pic are provided
            const newItem = document.createElement('div');
            newItem.classList.add('chat-item');
            // newItem.dataset.contact = `other-${index}`; // Add identifier if needed later
            newItem.innerHTML = `
                <img src="${pic}" alt="${name}" class="avatar">
                <div class="chat-info">
                    <div class="chat-header">
                        <div class="chat-name">${name}</div>
                        <div class="chat-time">${time}</div>
                    </div>
                    <div class="chat-preview">${message.length > 30 ? message.substring(0, 27) + '...' : message}</div>
                </div>
            `;
            // Add click listener for mobile view switching (basic version - just switches view)
            newItem.addEventListener('click', handleChatItemClick);
            chatItems.appendChild(newItem);
        }
    });
}


function renderMessages(messages, senderName, senderPic, receiverName, receiverPic) {
    messagesContainer.innerHTML = ''; // Clear previous messages

    messages.forEach(msg => {
        const isSent = msg.sender.toLowerCase() === 'sender';
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isSent ? 'sent' : 'received');

        const avatarSrc = isSent ? senderPic : receiverPic;
        const avatarAlt = isSent ? senderName : receiverName;

        messageDiv.innerHTML = `
            <img src="${avatarSrc}" alt="${avatarAlt}" class="avatar message-avatar">
            <div class="message-bubble">
                 <div class="message-content">
                    ${msg.message}
                 </div>
                 <div class="message-time">${msg.time}</div>
            </div>
        `;

        // Adjust bubble styling based on sender/receiver
         const bubble = messageDiv.querySelector('.message-bubble');
         const content = messageDiv.querySelector('.message-content');
         const time = messageDiv.querySelector('.message-time');

         if (isSent) {
             bubble.style.alignItems = 'flex-end';
             content.style.backgroundColor = 'var(--bg-message-sent)';
             content.style.color = 'var(--text-message-sent)';
             content.style.borderBottomRightRadius = '4px';
             content.style.borderBottomLeftRadius = '16px';
             time.style.textAlign = 'right';
         } else {
             bubble.style.alignItems = 'flex-start';
             content.style.backgroundColor = 'var(--bg-message-received)';
             content.style.color = 'var(--text-message-received)';
             content.style.borderBottomLeftRadius = '4px';
             content.style.borderBottomRightRadius = '16px';
             time.style.textAlign = 'left';
             // Hide avatar for received messages for LI look
             messageDiv.querySelector('.message-avatar').style.visibility = 'visible'; // Keep visible for alignment, can be hidden if needed
         }


        messagesContainer.appendChild(messageDiv);
    });

    // Scroll to the bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


function addOtherContactInput() {
    const newContactDiv = document.createElement('div');
    newContactDiv.classList.add('other-contact');
    newContactDiv.innerHTML = `
        <div class="config-group">
            <label>Name:</label>
            <input type="text" class="contact-name" placeholder="Contact Name">
        </div>
        <div class="config-group">
            <label>Picture URL:</label>
            <input type="text" class="contact-pic" placeholder="URL for profile pic" value="/api/placeholder/48/48">
        </div>
        <div class="config-group">
            <label>Last Message:</label>
            <input type="text" class="contact-message" placeholder="Last message preview">
        </div>
        <div class="config-group">
            <label>Time:</label>
            <input type="text" class="contact-time" placeholder="e.g., 10:30 AM, Yesterday">
        </div>
        <button class="config-button remove-contact-button" style="background-color: #dc3545; color: white; font-size: 12px; padding: 4px 8px; margin-top: 5px;">Remove</button>
    `;
    otherContacts.appendChild(newContactDiv);

    // Add remove functionality to the new button
    newContactDiv.querySelector('.remove-contact-button').addEventListener('click', () => {
        newContactDiv.remove();
    });
}

// Add remove functionality to existing remove buttons (if any were added manually in HTML)
otherContacts.querySelectorAll('.remove-contact-button').forEach(button => {
     button.addEventListener('click', (e) => {
         e.target.closest('.other-contact').remove();
     });
});


// --- Display Mode Logic ---

function setDisplayMode(mode) {
    if (mode === 'mobile') {
        chatContainer.classList.remove('desktop-mode');
        chatContainer.classList.add('mobile-mode');
        mobileModeRadio.checked = true;
        toggleMobileModeBtn.textContent = "Toggle Desktop Mode";
        // Ensure chat list is shown initially in mobile mode
        chatContainer.classList.remove('show-conversation');
    } else { // Desktop mode
        chatContainer.classList.remove('mobile-mode');
        chatContainer.classList.add('desktop-mode');
        desktopModeRadio.checked = true;
        toggleMobileModeBtn.textContent = "Toggle Mobile Mode";
        // Ensure both panels might be visible depending on screen size (CSS handles layout)
        chatContainer.classList.remove('show-conversation');
    }
    // Adjust layout based on mode potentially (handled by CSS)
}

function toggleDisplayMode() {
    if (chatContainer.classList.contains('mobile-mode')) {
        setDisplayMode('desktop');
    } else {
        setDisplayMode('mobile');
    }
}

// --- Theme Logic ---

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        darkModeRadio.checked = true;
        toggleThemeBtn.textContent = "Toggle Light Mode";
    } else { // Light mode
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        lightModeRadio.checked = true;
        toggleThemeBtn.textContent = "Toggle Dark Mode";
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

// --- Mobile Navigation ---

function handleChatItemClick(event) {
     const clickedItem = event.target.closest('.chat-item');
     if (!clickedItem) return; // Exit if click wasn't on a chat item

    // Remove active class from all items
    chatItems.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    // Add active class to the clicked item
    clickedItem.classList.add('active');

    // If in mobile mode, switch view
    if (chatContainer.classList.contains('mobile-mode')) {
        chatContainer.classList.add('show-conversation');
        // In a real app, you'd load the specific conversation data here based on clickedItem.dataset.contact
        // For this simulation, clicking any item shows the main conversation panel.
    }
     // If in desktop mode, clicking just highlights the item (CSS handles border).
     // The main conversation is assumed to be always visible or loaded.
}


function showChatListMobile() {
    if (chatContainer.classList.contains('mobile-mode')) {
        chatContainer.classList.remove('show-conversation');
         // Optional: Deactivate the active item when going back to the list
         const activeItem = chatItems.querySelector('.chat-item.active');
         if (activeItem) {
             // Keep main chat active, deselect others if needed
            //  if(activeItem.id !== 'mainChatItem') {
            //      activeItem.classList.remove('active');
            //  }
            // Or always keep the last clicked active
         }
    }
}

// --- Event Listeners ---

toggleConfigBtn.addEventListener('click', toggleConfigPanel);
cancelConfigBtn.addEventListener('click', hideConfigPanel);
applyConfigBtn.addEventListener('click', applyConfiguration);
toggleMobileModeBtn.addEventListener('click', toggleDisplayMode);
toggleThemeBtn.addEventListener('click', toggleTheme);
addContactBtn.addEventListener('click', addOtherContactInput);

// Mobile navigation back buttons
backButton.addEventListener('click', showChatListMobile);
backToListButton.addEventListener('click', showChatListMobile); // If this element is used

// Use event delegation for chat items as they can be added dynamically
chatItems.addEventListener('click', handleChatItemClick);

// Radio button listeners in config panel (optional, could rely solely on Apply button)
desktopModeRadio.addEventListener('change', () => setDisplayMode('desktop'));
mobileModeRadio.addEventListener('change', () => setDisplayMode('mobile'));
lightModeRadio.addEventListener('change', () => setTheme('light'));
darkModeRadio.addEventListener('change', () => setTheme('dark'));


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Applying initial configuration.");
    // Apply initial configuration based on default values in HTML/config panel
    applyConfiguration();
     // Ensure the main chat item is marked active initially
    mainChatItem.classList.add('active');
});