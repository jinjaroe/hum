# Note: for others recreating the virtual environment, you can install the necessary packages by running "pip install -r requirements.txt"
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List
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
df = pd.read_csv("aid_to_genre_ppps.csv")
artistColumn = "aid"
genreColumn = "genres"

@app.get("/get-genres/")
async def get_genres(artistIds: List[str] = Query(...)) -> dict:

    # Find rows where "aid" matches ids found in artistList, filter by those rows
    print("artistIds:", artistIds)
    filtered_df = df[df[artistColumn].isin(artistIds)]
    artist_genre_dict = {}
    for _, row in filtered_df.iterrows(): # (for index, row)
        artist_genre_dict[row[artistColumn]] = row[genreColumn].split("; ")
        
    return artist_genre_dict
