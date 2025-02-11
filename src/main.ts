const clientId = "2e09b5c382a44f29a81b0c72ffba8b16";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
  redirectToAuthCodeFlow(clientId);
} else {
  const timeRange: string = "long_term";
  const artistProfileId: string =
    "0TnOYISbd1XYRBk9myaseg?si=dkPZaESAT--ZyZWsnuq-9Q";
  const accessToken = await getAccessToken(clientId, code);
  const profile = await fetchProfile(accessToken);
  const topArtists = await fetchTopArtists(accessToken, timeRange);
  const topTracks = await fetchTopTracks(accessToken, timeRange);
  const artist = await fetchArtistProfile(accessToken, artistProfileId);
  // const enrichedArtistsDict = await fetchAndMergeArtistData(topArtists);
  //troubleshooting backend API call for fetching genres
  const artistIds = getArtistIDs(topArtists);
  const topArtistGenres = await fetchGenres(artistIds);
  // const topArtistGenresDict = fetchGenres(artistIds);

  console.log(
    "profile:",
    profile,
    "top artists:",
    topArtists,
    "top tracks:",
    topTracks,
    "artist:",
    artist
    // "ennriched top artists:",
    // enrichedArtistsDict
  );
  populateUI(profile, topArtists, topTracks, artist, topArtistGenres);
}

export async function redirectToAuthCodeFlow(clientId: string) {
  // TODO: Redirect to Spotify authorization page
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
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function getAccessToken(
  clientId: string,
  code: string
): Promise<string> {
  // TODO: Get access token for code
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
    body: params,
  });

  const { access_token } = await result.json();
  console.log("Access token: ", access_token);
  return access_token;
}

// getting profile data from Spotify WebAPI
async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
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

async function fetchGenres(artistIds: string[]) {
  const response = await fetch(
    `http://127.0.0.1:8000/get-genres/?artistIds=${artistIds.join(
      "&artistIds="
    )}`
  );
  const data = await response.json();
  return data;
}

async function fetchArtistProfile(
  token: string,
  artistProfileId: string
): Promise<any> {
  const result = await fetch(
    "https://api.spotify.com/v1/artists/" + artistProfileId,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return await result.json();
}

// async function fetchAndMergeArtistData(artists: artistProfile[]) {
//   const artistIds = artists.map((artist) => artist.id); // Extract only the IDs
//   const genresDict = await fetchGenres(artistIds); // Fetch genres from backend

//   // Merge genres with the existing artist data
//   const enrichedArtists = artists.map((artist) => ({
//     ...artist,
//     genres: genresDict[artist.id] || [], // Assign genres if found, else empty array
//   }));

//   console.log(enrichedArtists);
//   return enrichedArtists;
// }

// take object array of artists, return array of artist ids (string)
function getArtistIDs(artists: any = { items: [] }) {
  const artistIDs: string[] = [];
  artists.items.forEach((artist: any) => {
    artistIDs.push(artist.id);
  });
  return artistIDs;
}

// function calculateTopGenres(artistGenreDict: { [key: string]: string[] }) {
//   const genreCounts: { [key: string]: number } = {};
//   const artistList = Object.keys(artistGenreDict);

//   artistList.forEach((artist, index) => {
//     const weight = 1 / (index + 1); // Higher-ranked artists get more weight
//     artistGenreDict[artist].forEach((genre) => {
//       genreCounts[genre] = (genreCounts[genre] || 0) + weight;
//     });
//   });

//   return Object.entries(genreCounts).sort((a, b) => b[1] - a[1]); // Sort by weight
// }

function populateUI(
  profile: UserProfile,
  topArtists: any = { items: [] },
  topTracks: any = { items: [] },
  artist: artistProfile,
  artistGenres: artistGenres
) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  if (profile.images[0]) {
    const profileImage = new Image(200, 200);
    profileImage.src = profile.images[0].url;
    document.getElementById("avatar")!.appendChild(profileImage);
  }
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
  document.getElementById("imgUrl")!.innerText =
    profile.images[0]?.url ?? "(no profile image)";

  const topArtistsContainer = document.getElementById("topArtists");
  if (topArtistsContainer) {
    try {
      topArtists.items.forEach((artist: any) => {
        const artistElement = document.createElement("div");
        artistElement.innerText = artist.name;
        topArtistsContainer.appendChild(artistElement);
      });
    } catch (error) {
      console.error("Error fetching top artists:", error);
      topArtistsContainer.innerText = "Failed to load top artists.";
    }
  }

  const topTracksContainer = document.getElementById("topTracks");
  if (topTracksContainer) {
    try {
      topTracks.items.forEach((track: any) => {
        const trackElement = document.createElement("div");
        trackElement.innerText = track.name;
        topTracksContainer.appendChild(trackElement);
      });
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      topTracksContainer.innerText = "Failed to load top tracks.";
    }
  }

  const genresContainer = document.getElementById("topGenres");
  if (genresContainer) {
    try {
      // Iterate through topArtistGenres and create a formatted display
      for (const [artistId, genres] of Object.entries(artistGenres)) {
        const artistInfo = document.createElement("p");
        artistInfo.textContent = `${artistId}: ${genres.join(", ")}`; // Convert array to comma-separated string
        genresContainer.appendChild(artistInfo);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      genresContainer.innerText =
        "Failed to load genres dictionary from backend.";
    }
  }

  //display artist profile
  document.getElementById("artistName")!.innerText = artist.name;
  if (artist.images[0]) {
    const artistImage = new Image(200, 200);
    artistImage.src = artist.images[0].url;
    document.getElementById("artistAvatar")!.appendChild(artistImage);
  }
  document.getElementById("artistId")!.innerText = artist.id;
  const artistGenresContainer = document.getElementById("artistGenres");
  if (artistGenresContainer) {
    try {
      if (artist.genres.length == 0) {
        artistGenresContainer.innerText =
          "No genres attributed to this artist.";
      }
      artist.genres.forEach((genre: any) => {
        artistGenresContainer.innerText += genre + ", ";
      });
    } catch (error) {
      console.error("Error fetching artist genres:", error);
    }
  }
}
