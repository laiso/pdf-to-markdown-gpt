import { OpenAIClient, AzureKeyCredential, type ChatCompletions } from "@azure/openai";

const endpoint = process.env["AZURE_OPENAI_ENDPOINT"] as string;
const azureApiKey = process.env["AZURE_OPENAI_KEY"] as string;

export async function GET(request: Request) {
    const text = new URL(request.url).searchParams.get("text") ?? "";
    const messages = [
        { role: "system", content: "あなたはテキスト整形アシスタントです。それ以外の仕事はしないでください。" },
        { role: "user", content: text },
    ];

    const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(azureApiKey)
    );
    const deploymentId = "gpt-35-turbo";
    const events = client.listChatCompletions(deploymentId, messages, {
        functions: [
            {
                name: "send",
                description:
                    "userの入力したテキストを読みやすくMarkdownにして整形して送信します。見出し、リストを活用してください。内容は変更してはいけません。",
                parameters: {
                    type: "object",
                    properties: {
                        markdown: {
                            type: "string",
                            description: "Markdown形式のテキスト",
                        },
                    },
                    required: ["markdown"],
                },
            },
        ],
        functionCall: { name: "send" },
        temperature: 0.0,
        maxTokens: 2024,
    });


    let eventCount = 0;
    function iteratorToStream(iterator: AsyncGenerator<Uint8Array>) {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(`id: ${eventCount}\n`);
              },
              async pull(controller) {
                const { value, done } = await iterator.next();

                if (done) {
                    controller.close();
                } else {
                    controller.enqueue(`id: ${eventCount}\n`)
                    controller.enqueue(`data: ${value}\n\n`)
                    eventCount++
                }
              },
        });
    }

    const encoder = new TextEncoder();
    async function* makeIterator(events: AsyncIterable<ChatCompletions>) {
        let s = "";
        for await (const event of events) {
            for (const choice of event.choices) {
                s = (choice.delta?.functionCall?.arguments ?? "");
                if (s.length > 0) {
                    yield encoder.encode(s);
                }
            }
        }
    }

    const iterator = makeIterator(events);
    const stream = iteratorToStream(iterator);

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
