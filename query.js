const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function weather(location) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${location}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions';

// https://platform.openai.com/docs/api-reference/chat

async function chat(messages, functions) {
    const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            messages: messages,
            functions: functions,
            model: 'gpt-3.5-turbo'
        })
    });
    return await response.json();
}

const FUNCTION_DEFS = [{
    "name": "weather",
    "description": "Get the current weather in a given location",
    "parameters": {
        "type": "object",
        "required": ["location"],
        "properties": {
            "location": {
                "type": "string",
                "description": "The city, e.g. New York"
            }
        }
    }
}]

async function invokeFunction(name, args) {
    if (name === "weather") {
        const { location } = args;
        return await weather(location);
    }
}

async function converse(messages, functions) {
    if (messages.length > 13) {
        throw new Error("Too in-depth conversation!")
    }

    const response = await chat(messages, functions);
    const { choices } = response;
    const { message } = choices.pop();

    const { content, function_call } = message;

    if (function_call) {
        const { name, arguments } = function_call;
        const result = await invokeFunction(name, JSON.parse(arguments));
        messages.push(message);
        messages.push({
            "role": "function",
            "name": name,
            "content": JSON.stringify(result)
        });
        return converse(messages, functions);
    }

    return content;
}

async function query(inquiry) {
    const messages = [{
        role: "system",
        content: "Only use the functions you have been provided with."
    }, {
        role: "system",
        content: "Only answer in 50 words or less."
    }, {
        role: "user",
        content: inquiry
    }];
    return await converse(messages, FUNCTION_DEFS);
}

(async () => {
    try {
        if (!OPENAI_API_KEY || !OPENAI_API_KEY.length || OPENAI_API_KEY.length < 50)
            throw new Error("Invalid API key for OpenAI");
        if (!WEATHER_API_KEY || !WEATHER_API_KEY.length || WEATHER_API_KEY.length < 31)
            throw new Error("Invalid API key for WeatherAPI.com");

        const inquiry = process.argv.slice(2).join(" ");
        if (inquiry.length < 2)
            throw new Error("Supply some inquiry!");

        const answer = await query(inquiry);
        console.log(answer);
    } catch (error) {
        console.error(error);
    }
})();