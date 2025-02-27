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

  // The beginning of the file remains the same...

function populateUI(profile: any, topArtists: any = {items: []}, topTracks: any = {items: []}) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(75, 75);
        profileImage.src = profile.images[0].url;
        profileImage.className = "rounded-full w-[75px] h-[75px] object-cover border-[3px] border-[#d4d4d4]";
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);

    const topArtistsContainer = document.getElementById("topArtists");
    if (topArtistsContainer) {
      try {
        topArtists.items.forEach((artist: any) => {
            const artistElement = document.createElement("div");
            artistElement.className = "bg-[rgba(255,255,255,0.1)] p-3 rounded-lg mx-auto my-2 w-[90%] text-base text-[#e0e0e0] text-left flex items-center gap-3 transition-colors duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.2)]";
    
            const img = document.createElement("img");
            img.src = artist.images[0]?.url || "default-artist.png";
            img.alt = artist.name;
            img.className = "w-[50px] h-[50px] rounded-md object-cover";
    
            const name = document.createElement("span");
            name.innerText = artist.name;
    
            artistElement.appendChild(img);
            artistElement.appendChild(name);
            topArtistsContainer?.appendChild(artistElement);
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
            trackElement.className = "bg-[rgba(255,255,255,0.1)] p-3 rounded-lg mx-auto my-2 w-[90%] text-base text-[#e0e0e0] text-left flex items-center gap-3 transition-colors duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.2)]";
    
            const img = document.createElement("img");
            img.src = track.album.images[0]?.url || "default-track.png";
            img.alt = track.name;
            img.className = "w-[50px] h-[50px] rounded-md object-cover";
    
            const name = document.createElement("span");
            name.innerText = track.name;
    
            trackElement.appendChild(img);
            trackElement.appendChild(name);
            topTracksContainer?.appendChild(trackElement);
        });
      } catch (error) {
        console.error("Error fetching top tracks:", error);
        topTracksContainer.innerText = "Failed to load top tracks.";
      }
    }
  
    // The genre counting code remains the same
    const genreCounts: { [genre: string]: number } = {};
  
    topArtists.items.forEach((artist: any) => {
      artist.genres.forEach((genre: string) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
  
    const sortedGenres = Object.entries(genreCounts).sort(
      ([, countA], [, countB]) => countB - countA
    );
  
    const topGenres = sortedGenres.slice(0, 20).map(([genre]) => genre);
    console.log("Top Genres:", topGenres);
    const topGenresContainer = document.getElementById("topGenres");
    if (topGenresContainer) {
      try {
        topGenres.forEach((genre: any) => {
          const genreElement = document.createElement("div");
          genreElement.className = "p-2 bg-[rgba(255,255,255,0.1)] rounded-md my-1";
          genreElement.innerText = genre;
          topGenresContainer.appendChild(genreElement);
        });
      } catch (error) {
        console.error("Error fetching top genres:", error);
        topGenresContainer.innerText = "Failed to load top genres.";
      }
    }
}

// function populateUI(profile: any, topArtists: any = {items: []}, topTracks: any = {items: []}) {
//     document.getElementById("displayName")!.innerText = profile.display_name;
//     if (profile.images[0]) {
//         const profileImage = new Image(150, 150);
//         profileImage.src = profile.images[0].url;
//         document.getElementById("avatar")!.appendChild(profileImage);
//     }
//     document.getElementById("id")!.innerText = profile.id;
//     document.getElementById("email")!.innerText = profile.email;
//     document.getElementById("uri")!.innerText = profile.uri;
//     document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
//    /* document.getElementById("url")!.innerText = profile.href;
//     document.getElementById("url")!.setAttribute("href", profile.href);*/
//     /*document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';*/

//     const topArtistsContainer = document.getElementById("topArtists");
//     if (topArtistsContainer) {
//       try {
//         topArtists.items.forEach((artist: any) => {
//             const artistElement = document.createElement("div");
//             artistElement.classList.add("list-item");
    
//             const img = document.createElement("img");
//             img.src = artist.images[0]?.url || "default-artist.png";
//             img.alt = artist.name;
    
//             const name = document.createElement("span");
//             name.innerText = artist.name;
    
//             artistElement.appendChild(img);
//             artistElement.appendChild(name);
//             topArtistsContainer?.appendChild(artistElement);
//         });
//       } catch (error) {
//         console.error("Error fetching top artists:", error);
//         topArtistsContainer.innerText = "Failed to load top artists.";
//       }
//     }
  
//     const topTracksContainer = document.getElementById("topTracks");
//     if (topTracksContainer) {
//       try {
//         topTracks.items.forEach((track: any) => {
//             const trackElement = document.createElement("div");
//             trackElement.classList.add("list-item");
    
//             const img = document.createElement("img");
//             img.src = track.album.images[0]?.url || "default-track.png";
//             img.alt = track.name;
    
//             const name = document.createElement("span");
//             name.innerText = track.name;
    
//             trackElement.appendChild(img);
//             trackElement.appendChild(name);
//             topTracksContainer?.appendChild(trackElement);
//         });
//       } catch (error) {
//         console.error("Error fetching top tracks:", error);
//         topTracksContainer.innerText = "Failed to load top tracks.";
//       }
//     }
  
//     //Loop through genres arrays of all top artists
//     //Create dictionary or object to count occurrences of each genre
//     const genreCounts: { [genre: string]: number } = {};
  
//     topArtists.items.forEach((artist: any) => {
//       artist.genres.forEach((genre: string) => {
//         genreCounts[genre] = (genreCounts[genre] || 0) + 1;
//       });
//     });
  
//     //convert genre count object into array of key-value pairs
//     //sort array by frequency in decending order
//     const sortedGenres = Object.entries(genreCounts).sort(
//       ([, countA], [, countB]) => countB - countA
//     );
  
//     //display top genres
//     const topGenres = sortedGenres.slice(0, 20).map(([genre]) => genre);
//     console.log("Top Genres:", topGenres);
//     const topGenresContainer = document.getElementById("topGenres");
//     if (topGenresContainer) {
//       try {
//         topGenres.forEach((genre: any) => {
//           const genreElement = document.createElement("div");
//           genreElement.innerText = genre;
//           topGenresContainer.appendChild(genreElement);
//         });
//       } catch (error) {
//         console.error("Error fetching top genres:", error);
//         topGenresContainer.innerText = "Failed to load top genres.";
//       }
//     }
//   }