<script lang="ts">
  import { onMount } from "svelte";

  type Message = {
    text: string;
    type: "user" | "bot";
  };

  let messages: Message[] = [];
  let inputMessage: string = "";
  let themeColor: string = "#007aff";

  onMount(() => {
    const savedColor = localStorage.getItem("themeColor");
    if (savedColor) {
      themeColor = savedColor;
      updateThemeColor();
    }
  });

  function scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector(".messages");
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }

  function updateThemeColor() {
    document.documentElement.style.setProperty("--theme-color", themeColor);
    localStorage.setItem("themeColor", themeColor);
  }

  async function sendMessage() {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { text: inputMessage, type: "user" };
    messages = [...messages, userMessage];
    inputMessage = "";

     // Show "Thinking..." message in the chat
   const thinkingMessage: Message = { text: "Thinking...", type: "bot" };
   messages = [...messages, thinkingMessage];

    scrollToBottom();

    try {
      const res = await fetch("/api2/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const data = await res.json();
      messages = [...messages.slice(0, -1), { text: data.response, type: "bot" }];


      scrollToBottom();

    } catch (error) {
      console.error("Fetch error:", error);
      messages = [...messages.slice(0, -1), { text: "Error connecting to server.", type: "bot" }];

      scrollToBottom();
    }
  }
</script>

<main>
  <div class="chat-container">
    <div class="chat-header">
      <h1 class="chat-title">AI-Chatbot</h1>

      <div class="theme-picker">
        <label for="themeColor">Customize Theme:</label>
        <input type="color" id="themeColor" bind:value={themeColor} on:change={updateThemeColor} />
      </div>
    </div>

    <div class="chatbox">
      <div class="messages">
        {#each messages as msg}
          <div class={msg.type === "user" ? "user-message" : "bot-message"}>
            {msg.text}
          </div>
        {/each}
      </div>

      <div class="input-area">
        <input
          type="text"
          bind:value={inputMessage}
          on:keydown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
        />
        <button type="button" on:click={sendMessage}>Send</button>
      </div>
    </div>
  </div>
</main>

<style>
  :root {
    --theme-color: #007aff;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  main {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.8);
  }

  .chat-container {
    width: 70%;
    height: 650px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 15px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .chat-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .chat-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
  }

  .theme-picker {
    display: flex;
    align-items: center;
    gap: 10px;
    color: white;
  }

  .chatbox {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    padding: 15px;
    overflow: hidden;
  }

  .messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    max-height: calc(100% - 50px);
    padding: 10px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
  }

  .user-message,
  .bot-message {
    padding: 12px 16px;
    border-radius: 20px;
    max-width: 75%;
    word-wrap: break-word;
    font-size: 1rem;
  }

  .user-message {
    background: var(--theme-color);
    color: white;
    align-self: flex-end;
  }

  .bot-message {
    background: #333;
    color: white;
    align-self: flex-start;
  }

  .input-area {
    display: flex;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #555;
  }

  input {
    flex-grow: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #555;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    outline: none;
  }

  input::placeholder {
    color: #ccc;
  }

  button {
    padding: 12px 18px;
    border-radius: 10px;
    border: none;
    background: var(--theme-color);
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  button:hover {
    filter: brightness(0.85);
  }

  /* Scrollbar styling */
.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.messages::-webkit-scrollbar-thumb {
  background: rgba(200, 200, 200, 0.6);
  border-radius: 10px;
  transition: background 0.3s ease;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.8);
}

  @media (max-width: 500px) {
    .chat-container {
      width: 90%;
      height: 90vh;
      padding: 15px;
    }

    .chat-title {
      font-size: 1.3rem;
    }

    input,
    button {
      font-size: 0.9rem;
      padding: 10px;
    }
  }
</style>
