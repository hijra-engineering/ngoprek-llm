const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CHAT_MODEL = process.env.CHAT_MODEL || 'text-davinci-003';

async function complete(prompt) {
    const response = await fetch(`${OPENAI_API_BASE}/v1/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            model: CHAT_MODEL,
            max_tokens: 40,
            temperature: 0.3
        })
    });
    const data = await response.json();
    const { choices } = data;
    const { text } = choices.pop();
    return text;
}

(async () => {
    try {
        if (OPENAI_API_BASE.indexOf("openai") > 0) {
            if (!OPENAI_API_KEY || !OPENAI_API_KEY.length || OPENAI_API_KEY.length < 50)
                throw new Error("Invalid API key for OpenAI");
        }

        const input = process.argv.slice(2).join(" ");
        if (input.length < 2)
            throw new Error("Supply some input!");
        const completion = await complete(input);
        console.log(input, completion);
    } catch (error) {
        console.error(error);
    }
})();
