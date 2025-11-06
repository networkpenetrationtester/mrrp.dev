// Defines the shape of the online status object returned
export interface LanyardResponse {
	online: boolean; // true if user is online, false if offline
}

// Fetches the Discord user's online status from Lanyard API
export async function fetchOnline(): Promise<LanyardResponse> {
	try {
		// Fetch user data from Lanyard for the hardcoded Discord ID
		const res = await fetch(`https://api.lanyard.rest/v1/users/470661201949622275`);

		// Parse JSON response
		const data = await res.json();

		// If response is not OK or Lanyard reports failure, throw an error
		if (!res.ok || !data?.success) {
			throw new Error('Failed to fetch Lanyard API');
		}

		// Return a simple object with online boolean (status not "offline")
		return { online: data.data.discord_status !== 'offline' };
	} catch (err) {
		// Log errors to console and return safe default
		console.error('Failed to fetch Lanyard', err);

		return { online: false };
	}
}
