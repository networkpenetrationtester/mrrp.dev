import type { RequestHandler } from '@sveltejs/kit';

// Base URL for the Lanyard API
const LANYARD_BASE = 'https://api.lanyard.rest/v1/users';

// GET request handler for fetching Discord online status via Lanyard
export const GET: RequestHandler = async ({ params }) => {
	// Extract Discord ID from URL params
	const discordId = params.discordId;

	try {
		// Fetch user data from Lanyard API
		const res = await fetch(`${LANYARD_BASE}/${discordId}`);

		// Throw error if response is not OK
		if (!res.ok) throw new Error(`Lanyard API returned ${res.status}`);

		// Parse JSON response
		const data = await res.json();

		// Determine if user is online (status not "offline")
		const online = data?.data?.discord_status !== 'offline';

		// Return JSON response with online boolean
		return new Response(JSON.stringify({ online }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		// Return JSON error response if something goes wrong
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};
