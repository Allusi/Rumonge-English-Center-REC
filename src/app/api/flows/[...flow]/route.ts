
import { lookupFlow, runFlow } from 'genkit';
import { NextRequest, NextResponse } from 'next/server';

// This is the entry point that registers all of our flows.
import '@/ai/dev';

async function handler(req: NextRequest) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-genkit-api-key',
    };

    if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return NextResponse.json({ message: "Genkit flows are running. Use POST to execute a flow." }, { status: 200, headers });
    }

    const url = new URL(req.url);
    // The flow ID is the path after /api/flows/
    const flowId = url.pathname.split('/api/flows/')[1];
    
    if (!flowId) {
        return NextResponse.json({ error: 'Flow not specified' }, { status: 400, headers });
    }

    const flow = lookupFlow(flowId);
    if (!flow) {
        return NextResponse.json({ error: `Flow not found: ${flowId}` }, { status: 404, headers });
    }
    
    const input = await req.json();

    try {
        const output = await runFlow(flow, input);
        return NextResponse.json(output, { headers });
    } catch (e: any) {
        console.error(`Error running flow ${flowId}:`, e);
        return NextResponse.json(
            { error: 'Flow execution failed', details: e.message },
            { status: 500, headers }
        );
    }
}

export { handler as GET, handler as POST, handler as OPTIONS };
