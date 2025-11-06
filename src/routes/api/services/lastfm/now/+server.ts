import type { RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Base URL for the Last.fm API
const LASTFM_API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

export const GET: RequestHandler = async ({ url }) => {
	// Read the Last.fm API key from environment variables
	const apiKey = env.LASTFM_API_KEY;
	// Read the username from query string or fallback to environment variable
	const user = url.searchParams.get('user') || env.LASTFM_USER;

	// If API key is missing, return error response
	if (!apiKey) {
		return jsonError('Missing LASTFM_API_KEY', 500);
	}

	// If username is missing, return error response
	if (!user) {
		return jsonError('Missing username (?user= or LASTFM_USER)', 400);
	}

	// Construct the API request query parameters
	const params = new URLSearchParams({
		method: 'user.getrecenttracks', // Last.fm method to get latest played tracks
		user, // Last.fm username
		api_key: apiKey, // API key for authentication
		format: 'json', // Response format
		limit: '2' // How many tracks to retrieve
	});

	// Fetch data from Last.fm
	const res = await fetch(`${LASTFM_API_ROOT}?${params}`);
	if (!res.ok) {
		// If the API returns an error, pass it back with status code
		return jsonError('Last.fm error', res.status, await res.text());
	}

	// Parse JSON response safely
	const data = await res.json().catch(() => null);
	const tracks = data?.recenttracks?.track;

	// Ensure we have a valid track array
	if (!Array.isArray(tracks) || tracks.length === 0) {
		return jsonError('Unexpected Last.fm response', 502, data);
	}

	// Take the first track (the most recent one)
	const first = tracks[0];
	// Check if it’s currently being played
	const nowPlaying = !!first?.['@attr']?.nowplaying;

	// Construct simplified response object
	const output = {
		nowPlaying, // Whether the track is currently playing
		artist: first?.artist?.['#text'] ?? null, // Artist name
		title: first?.name ?? null, // Track title
		url: first?.url ?? null, // Last.fm track URL
		image: first?.image?.find((img: any) => img.size === 'large')?.['#text'] ?? null, // Album art
		playedAt: nowPlaying ? null : first?.date?.uts ? Number(first.date.uts) : null // Unix timestamp if not currently playing
	};

	// Return formatted JSON response
	return new Response(JSON.stringify(output), {
		headers: { 'Content-Type': 'application/json' }
	});
};

// Helper function to return JSON error responses
function jsonError(message: string, status: number, details?: unknown): Response {
	return new Response(JSON.stringify({ error: message, ...(details ? { details } : {}) }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}
