interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

interface artistProfile {
  external_urls: {
    spotify: string;
  };
  followers: { href: string; total: number };
  genres: [];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

interface artistList {
  href: string; // URL for the API request
  items: Artist[]; // Array of artist objects (each follows the 'Artist' structure)
  artists: Artist[];
  limit: number; // The limit on the number of artists returned
  offset: number; // The offset for pagination
  total: number; // The total number of artists available
  next: string | null; // URL for the next set of artists (or null if no more results)
  previous: string | null; // URL for the previous set of artists (or null if none)
}

// //object structure for artists extracted from tracks
// interface trackArtists {
//   external_urls: {
//     spotify: string;
//   };
//   href: string;
//   id: string;
//   name: string;
//   type: string;
//   uri: string;
// }

interface trackList {
  href: string;
  items: Track[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

interface artistGenres {
  artist_genres: {};
}
