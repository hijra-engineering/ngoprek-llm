const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

// https://platform.openai.com/docs/api-reference/chat

async function chat(messages) {
    const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            messages: messages,
            model: 'gpt-3.5-turbo'
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
        if (!OPENAI_API_KEY || !OPENAI_API_KEY.length || OPENAI_API_KEY.length < 50)
            throw new Error("Invalid API key for OpenAI");

        const question = process.argv.slice(2).join(" ");
        if (question.length < 2)
            throw new Error("Supply some question!");

        const answer = await ask(question);
        console.log(answer);
    } catch (error) {
        console.error(error);
    }
})();