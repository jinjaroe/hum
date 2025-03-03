const clientId = "cf3efe6444f04ec6b3fa61d142b470f6";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const timeRange: string = "long_term"
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const artists = await fetchTopArtists(accessToken, timeRange);
    const tracks = await fetchTopTracks(accessToken, timeRange);
    console.log("artist: ", artists, "tracks", tracks);
    populateUI(profile, artists, tracks);
}

export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function fetchTopArtists(token: string, timeRange: string): Promise<any> {
    const result = await fetch(
      "https://api.spotify.com/v1/me/top/artists?time_range=" + timeRange,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await result.json();
}
  
async function fetchTopTracks(token: string, timeRange: string): Promise<any> {
    const result = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=" + timeRange,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return await result.json();
}

function populateUI(profile: any, topArtists: any = {items: []}, topTracks: any = {items: []}) {
    // Handle profile data
    document.getElementById("displayName")!.innerText = profile.display_name;
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    
    if (document.getElementById("uri")) {
        document.getElementById("uri")!.innerText = profile.uri;
        document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    }
    
    // Handle profile image
    if (profile.images && profile.images.length > 0) {
        const avatarContainer = document.getElementById("avatar");
        if (avatarContainer) {
            // Clear any existing content
            avatarContainer.innerHTML = '';
            
            // Create profile image with Tailwind classes
            const profileImage = new Image();
            profileImage.src = profile.images[0].url;
            profileImage.alt = profile.display_name;
            profileImage.className = "w-full h-full object-cover";
            
            avatarContainer.appendChild(profileImage);
        }
    }
    
    // Visualization functionality would go here
    // Instead of populating lists, you'd create your visualization
    const contentContainer = document.getElementById("content");
    if (contentContainer) {
        // For now, just indicate that data is loaded
        contentContainer.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <p class="text-gray-400">Loaded ${topArtists.items.length} artists and ${topTracks.items.length} tracks</p>
            </div>
        `;
        
        // Your visualization code would go here
        // You'll need to implement the scatter plot or whatever visualization
        // is shown in the image based on the genre data
    }
    
    // Calculate genre data (as in your original code)
    const genreCounts: { [genre: string]: number } = {};
  
    topArtists.items.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
  
    // Convert genre count object into array of key-value pairs
    // Sort array by frequency in descending order
    const sortedGenres = Object.entries(genreCounts).sort(
      ([, countA], [, countB]) => countB - countA
    );
  
    // Get top genres
    const topGenres = sortedGenres.slice(0, 20).map(([genre]) => genre);
    console.log("Top Genres:", topGenres);
}