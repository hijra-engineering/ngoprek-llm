const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-3.5-turbo';

// https://platform.openai.com/docs/api-reference/chat

const PRECISE_TEMPERATURE = 0.1;
const CREATIVE_TEMPERATURE = 1.2;

async function chat(messages) {
    const response = await fetch(`${OPENAI_API_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            messages: messages,
            model: CHAT_MODEL,
            temperature: PRECISE_TEMPERATURE
        })
    });
    return await response.json();
}

async function ask(question) {
    const messages = [{
        role: "system",
        content: "You are a helpful assistant."
    }, {
        role: "system",
        content: "Only answer in 50 words or less."
    }, {
        role: "user",
        content: "What is the largest planet?"
    }, {
        role: "assistant",
        content: "Jupiter"
    }, {
        role: "user",
        content: question
    }];

    const response = await chat(messages);

    const { choices } = response;
    const { message } = choices.pop();
    const { role, content } = message;

    return role === "assistant" ? content : null;
}

(async () => {
    try {
        if (OPENAI_API_BASE.indexOf("openai") > 0) {
            if (!OPENAI_API_KEY || !OPENAI_API_KEY.length || OPENAI_API_KEY.length < 50)
                throw new Error("Invalid API key for OpenAI");
        }

        const question = process.argv.slice(2).join(" ");
        if (question.length < 2)
            throw new Error("Supply some question!");

        const answer = await ask(question);
        console.log(answer);
    } catch (error) {
        console.error(error);
    }
})();