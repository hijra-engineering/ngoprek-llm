const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const COMPLETION_API_URL = 'https://api.openai.com/v1/completions';

async function complete(prompt) {
    const response = await fetch(COMPLETION_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            model: 'text-davinci-003',
            max_tokens: 40
        })
    });
    const data = await response.json()
    const { choices } = data;
    const { text } = choices.pop();
    return text;
}

(async () => {
    try {
        if (!OPENAI_API_KEY || !OPENAI_API_KEY.length || OPENAI_API_KEY.length < 50)
            throw new Error("Invalid API key for OpenAI");

        const input = process.argv.slice(2).join(" ");
        if (input.length < 2)
            throw new Error("Supply some input!");
        const completion = await complete(input);
        console.log(input, completion);
    } catch (error) {
        console.error(error);
    }
})();