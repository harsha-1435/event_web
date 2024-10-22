// Event data
const events = [
    { 
        id: 1, 
        name: "Augmented and Virtual Reality Expo", 
        organization: "Tech World", 
        description: "An immersive experience showcasing the latest in AR and VR technology.", 
        time: "2024-11-05 10:00 AM" 
    },
    { 
        id: 2, 
        name: "AI and ML Workshop", 
        organization: "AI Leaders", 
        description: "A hands-on workshop focused on Artificial Intelligence and Machine Learning techniques.", 
        time: "2024-11-10 11:00 AM" 
    },
    { 
        id: 3, 
        name: "Hackathon: Code for Cause", 
        organization: "InnovateX", 
        description: "A 24-hour coding marathon aimed at building solutions for social causes.", 
        time: "2024-12-01 09:00 AM" 
    },
    { 
        id: 4, 
        name: "IoT Hackathon", 
        organization: "InnovateX", 
        description: "A competition to create IoT solutions for real-world problems.", 
        time: "2024-12-01 09:00 AM" 
    },
    
   
];

function openEventDetails(eventItem) {
    const eventDetails = {
        title: eventItem.dataset.title,
        description: eventItem.dataset.description,
        schedule: eventItem.dataset.schedule,
        venue: eventItem.dataset.venue,
        organizer: eventItem.dataset.organizer,
        requirements: eventItem.dataset.requirements,
        cost: eventItem.dataset.cost
    };

    // Store event details in localStorage
    localStorage.setItem('eventDetails', JSON.stringify(eventDetails));

    // Navigate to event-details.html
    window.location.href = 'event-details.html';
}

window.onload = function() {
    // Select the chatbot robo and the assist text
    const chatbotRobo = document.getElementById('chatbotRobo');
    const assistText = document.getElementById('assistText');
    
    // Start the animation after a slight delay (e.g., 1 second)
    setTimeout(() => {
        chatbotRobo.style.opacity = 1;
        chatbotRobo.style.animation = 'moveRobo 3s ease forwards'; // 3 seconds to move
    }, 1000);

    // Once the animation completes, display the assist text
    chatbotRobo.addEventListener('animationend', () => {
        assistText.classList.add('show-text');
    });
};



// Reference elements
const eventList = document.getElementById('eventList');
const eventDetailsModal = document.getElementById('eventDetailsModal');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');
const eventTime = document.getElementById('eventTime');
const closeModal = document.querySelector('.close');

// Chatbot references
const messages = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// Populate the event list
events.forEach(event => {
    const listItem = document.createElement('li');
    listItem.textContent = `${event.name} by ${event.organization}`;
    listItem.addEventListener('click', () => {
        displayEventDetails(event);
    });
    eventList.appendChild(listItem);
});

// Display event details in modal
function displayEventDetails(event) {
    eventTitle.textContent = event.name;
    eventDescription.textContent = event.description;
    eventTime.textContent = `Scheduled for: ${event.time}`;
    eventDetailsModal.style.display = 'block';
}

// Close the modal
closeModal.addEventListener('click', () => {
    eventDetailsModal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === eventDetailsModal) {
        eventDetailsModal.style.display = 'none';
    }
});

// Chatbot logic
sendBtn.addEventListener('click', () => {
    const userMessage = userInput.value;
    addMessage('You', userMessage);
    handleChatbotResponse(userMessage);
    userInput.value = '';  // Clear input field
});

let registrationData = {
    events: [],
    name: '',
    email: ''
};
let waitingFor = '';  // Tracks what information we're waiting for from the user


function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${sender}: ${text}\n`;  // Adding a newline character
    messages.appendChild(messageDiv);

    // Ensure that every message has a bit of space by appending a blank div or br
    const spaceDiv = document.createElement('div');
    spaceDiv.innerHTML = '<br>';  // Adding a blank space for separation
    messages.appendChild(spaceDiv);
}

function handleChatbotResponse(message) {
    let response = '';
    const lowercaseMessage = message.toLowerCase();

    // Regex to detect date in user message (formats like '2024-11-05' or 'November 5')
    const dateRegex = /\b(202\d-[0-1]\d-[0-3]\d)\b|\b(january|february|march|april|may|june|july|august|september|october|november|december) (\d{1,2})\b/;
    const dateMatch = lowercaseMessage.match(dateRegex);

    if (lowercaseMessage.includes('register me for')) {
        const eventNames = lowercaseMessage.split('register me for')[1].trim();
        registrationData.events = eventNames.split(',').map(e => e.trim());  // Handle multiple events
        response = `Which name should I use to register you for ${registrationData.events.join(', ')}?`;
        waitingFor = 'name';  // Now we wait for the user's name
    } 
    // Collect user's name
    else if (waitingFor === 'name') {
        registrationData.name = message.trim();
        response = `Thanks, ${registrationData.name}. Now, please provide your email address.`;
        waitingFor = 'email';  // Now we wait for the email
    } 
    // Collect user's email and submit the registration
    else if (waitingFor === 'email') {
        registrationData.email = message.trim();
        response = `Thank you! Registering you for the following events: ${registrationData.events.join(', ')}...`;

        // Send registration data to backend
        registerUser(registrationData);
        waitingFor = '';  // Reset the waiting state
    } 
    // Check if user is asking about events on a particular date
    else if (dateMatch) {
        const eventDate = dateMatch[1] || dateMatch[0];  // Either 'YYYY-MM-DD' or 'Month Day' format
        response = `Here are the events happening on ${eventDate}:\n`;

        // Filter events by the specified date
        const filteredEvents = events.filter(event => {
            const eventDateFormatted = new Date(event.time).toISOString().split('T')[0];  // Extract YYYY-MM-DD format
            return event.time.toLowerCase().includes(eventDate.toLowerCase());
        });

        // Generate response based on filtered events
        if (filteredEvents.length > 0) {
            filteredEvents.forEach(event => {
                response += `- ${event.name} by ${event.organization}, scheduled at ${event.time}\n`;
            });
        } else {
            response = `There are no events scheduled on ${eventDate}.`;
        }
    } 
    // Check if user is registering for events
    
    
    // List all events in a line-by-line format
    else if (lowercaseMessage.includes('technical events') || lowercaseMessage.includes('all events')) {
        response = 'Here is the list of Technical events:\n';
        events.forEach(event => {
            response += `- ${event.name} by ${event.organization} on ${event.time}\n`;
        });
    } 
    // Handling other chatbot responses...
    else if (lowercaseMessage.includes('schedule')) {
        response = ` ${events[0].name}, scheduled on ${events[0].time}.`;
    } else if (lowercaseMessage.includes('register')) {
        response = "To register, please provide your name and email, and mention which event you'd like to register for.";
    } else if (lowercaseMessage.includes('details')) {
        const eventName = lowercaseMessage.split('details about')[1]?.trim();
        const foundEvent = events.find(event => event.name.toLowerCase() === eventName);
        if (foundEvent) {
            response = `Details for ${foundEvent.name}: ${foundEvent.description}. Scheduled on: ${foundEvent.time}`;
        } else {
            response = "Sorry, I couldn't find the event you are asking about. Please try again.";
        }
    } else if (lowercaseMessage.includes('time for')) {
        const eventName = lowercaseMessage.split('time for')[1]?.trim();
        const foundEvent = events.find(event => event.name.toLowerCase() === eventName);
        if (foundEvent) {
            response = `The event ${foundEvent.name} is scheduled for ${foundEvent.time}.`;
        } else {
            response = "Sorry, I couldn't find the event you are asking about. Please try again.";
        }
    } else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
        response = "Hello! How can I assist you with event information or registration today?";
    } else if (lowercaseMessage.includes('thank you') || lowercaseMessage.includes('thanks')) {
        response = "You're welcome! Feel free to ask if you have more questions.";
    } else {
        response = "I can help you with event schedules, details, and registrations. Just ask!";
    }

    // Display bot's response
    addMessage('Bot', response);
}


// Function to send registration data to the backend
async function registerUser(data) {
    try {
        // Simulate an API call to register the user
        const response = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        // Handle the response
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error; // Rethrow or handle the error accordingly
    }
}



