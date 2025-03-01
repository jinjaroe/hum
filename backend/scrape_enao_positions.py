# -*- coding: utf-8 -*-

import os
import pandas as pd
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# chromeDriver_path = "chromedriver_mac_arm64/chromedriver"
# options = webdriver.ChromeOptions()

# # change to project dir
# if os.getcwd()[-17:] != "spotify-genre-map":
#     os.chdir("/Users/jonathanback/Documents/projects/hum")

# set up selenium driver
options = Options()
options.add_argument("--headless")  # Runs Chrome in headless mode
# driver = webdriver.Chrome(service=service, options=options)
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)
url = "https://everynoise.com/"
driver.get(url)

# scrape all genres + convert style attributes to DataFrame
# genres_elems = driver.find_elements_by_class_name("genre")
genres_elems = driver.find_elements("class name", "genre")

genres_objs = [ ]
for genre in genres_elems:
    genre_obj = {
        "genre": genre.get_attribute("innerText"),
        "preview_url": genre.get_attribute("preview_url"),
        "preview_track": genre.get_attribute("title")
    }
    
    for style in genre.get_attribute("style").split(";")[:-1]:
        [key,value] = style.split(":")
        genre_obj[key.strip().replace("-", "_")] = value.strip()
    
    genres_objs.append(genre_obj)
    
genres_df = pd.DataFrame(genres_objs)

# add run date to df
today = datetime.today().strftime("%Y%m%d")
genres_df["run_date"] = today

# save data
genres_df.to_csv("data/enao-genres-%s.csv" % today, index = False)
genres_df.to_csv("enao-genres-latest.csv", index = False)