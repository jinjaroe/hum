# Note: for others recreating the virtual environment, you can install the necessary packages by running "pip install -r requirements.txt"
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Dict
# import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Change this to match your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# load csv data once to avoid reloading on every request
df1 = pd.read_csv("data/aid_to_genre_ppps.csv")
artistColumn = "aid"
genreColumn = "genres"

@app.get("/get-genres/")
async def get_genres(artistIds: List[str] = Query(...)) -> dict:

    # Find rows where "aid" matches ids found in artistList, filter by those rows
    print("artistIds:", artistIds)
    filtered_df = df1[df1[artistColumn].isin(artistIds)]
    artist_genre_dict = {}
    for _, row in filtered_df.iterrows(): # (for index, row)
        artist_genre_dict[row[artistColumn]] = row[genreColumn].split("; ")

    return artist_genre_dict


df2 = pd.read_csv("data/enao-genres-20250227.csv")
@app.get("/get-genre-coordinates/")
async def get_genre_coordinates(genres: List[str] = Query(...)) -> Dict[str, dict]:
    """
    Returns a dictionary of genre -> coordinates (x, y) and other properties (like color and font_size).
    :param genres: List of genre names to fetch coordinates for.
    :return: Dictionary with genre names as keys and coordinates and other properties as values.
    """
    genre_coordinates = {}

    # Filter the dataframe for the requested genres
    filtered_df = df2[df2['genre'].isin(genres)]

    # Build the coordinates dictionary
    for _, row in filtered_df.iterrows():
        genre_name = row['genre']
        genre_coordinates[genre_name] = {
            'coordinates': {'x': row['left'], 'y': row['top']},  # 'left' is x, 'top' is y
            # 'color': row['color'],
            # 'font_size': row['font_size']
        }

    return genre_coordinates