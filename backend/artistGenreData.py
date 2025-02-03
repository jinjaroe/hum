import pandas as pd

def load_artist_genres(csv_filename, artistList):
    df = pd.read_csv(csv_filename)
    artistColumn = "aid"
    genreColumn = "genres"

    # Find rows where "aid" matches ids found in artistList, filter by those rows
    filtered_df = df[df[artistColumn].isin(artistList)]
    artist_genre_dict = {}
    for _, row in filtered_df.iterrows(): # (for index, row)
        artist_genre_dict[row[artistColumn]] = row[genreColumn].split("; ")

    # artist_genre_dict = {
    #     row[artistColumn]: row[genreColumn].split("; ")
    #     for _, row in filtered_df.iterrows()
    # }

    return artist_genre_dict

csv_file = "aid_to_genre_ppps.csv"
artists = ['001o475CIcdKHkvgKc9t8H', '001aMZmIe6t7ZQBSWtECYp', 
    '001LfEILiEVfCykMMiH0AO', '00190FC20vIUv0wXpeTf8S', '000sMlXYCiDz51cHgoU39P']

artist_genre_mapping = load_artist_genres(csv_file, artists)
print(artist_genre_mapping["001o475CIcdKHkvgKc9t8H"])
#{'000sMlXYCiDz51cHgoU39P': ['subliminal product'], '00190FC20vIUv0wXpeTf8S': ['beatboxing'], '001LfEILiEVfCykMMiH0AO': ['cantonese worship'], '001aMZmIe6t7ZQBSWtECYp': ['emoplugg', 'glitchcore'], '001o475CIcdKHkvgKc9t8H': ['australian hip hop', 'aussie drill', 'australian underground hip hop']}