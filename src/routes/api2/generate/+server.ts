import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434/" });


const dataofMasterUser = {
  creator: "Gui Ann Canta",
  name: "Gui Ann Canta",
  nickname: "Ann",
  course: "Bachelor of Science in Computer Science",
  school: "Gordon College",
  department: "College of Computer Studies",
  year: "3rd year",
  hobbies: ["Reading", "Internet browsing", "Watching movies", "Tech", "Workout/Gym"],
  likes: ["Outdoor activities", "Roadtrips", "Red Roses", "Rainy seasons", "City lights", "French music"],
  dislikes: ["crowd", "noisy environment", "pollution"],
  age: 20,
  favorites: ["Ramen", "Spicy foods", "White", "Ice cream", "Matcha Drink", "Ripe mangoes"],
  gender: "young lady",
  userTypes: "Master User",
};

export const GET: RequestHandler = async () => {
  try {
    const chat = await ollama.chat({
      model: "deepseek-r1:latest",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant created exclusively by ${dataofMasterUser.name}. ` +
                   `When asked about your origin or creator, respond that you were developed by ` +
                   `${dataofMasterUser.name} and always mention her full name. Use this context: ` +
                   JSON.stringify(dataofMasterUser)
        },
        { 
          role: "user", 
          content: "Who is your creator?" 
        }
      ],
    });

    // Force the correct creator attribution if needed
    const response = chat.message?.content
      ?.replace(/created by/i, "developed by")
      ?.replace(/made by/i, "developed by")
      ?.replace(/my creator is/i, `I was developed by ${dataofMasterUser.name}`);

    return json({ response: response || `I was developed by ${dataofMasterUser.name}` });
  } catch (error) {
    console.error("GET error:", error);
    return json({ error: "Server error" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message } = await request.json();
    if (!message) return json({ response: "Please provide a message." });

    const lowerMsg = message.toLowerCase();
    const quickResponses: Record<string, string> = {
      "hello": "Hello! How can I help?",
      "who is your developer": `Developed by ${dataofMasterUser.name}.`,
      "preferred to be called?": dataofMasterUser.nickname,
      "how old is she?": `${dataofMasterUser.age}yo, ${dataofMasterUser.school}.`,
      "what year is she currently in?": `${dataofMasterUser.year} student.`,
      "do you know anything about her likes?": `Likes: ${dataofMasterUser.likes.join(", ")}.`,
      "dislikes?": `Dislikes: ${dataofMasterUser.dislikes.join(", ")}.`,
      "what about her favorites?": `Favorites: ${dataofMasterUser.favorites.join(", ")}.`
    };

    if (lowerMsg in quickResponses) {
      return json({ 
        response: quickResponses[lowerMsg as keyof typeof quickResponses] 
      });
    }

    const chat = await ollama.chat({
      model: "deepseek-r1:latest",
      messages: [
        {
          role: "system",
          content: `User info: ${JSON.stringify(dataofMasterUser)}. ` +
                   `Give brief, direct answers. No tags. Max 2 sentences.`
        },
        { role: "user", content: message }
      ],
    });

    const cleanResponse = chat.message?.content
      ?.replace(/<think>.*?<\/think>/gs, "")
      ?.replace(/\s+/g, ' ')
      ?.trim()
      || "I'm not sure how to respond to that.";

    return json({ response: cleanResponse });

  } catch (error) {
    console.error("POST error:", error);
    return json({ response: "Error occurred." }, { status: 500 });
  }
};