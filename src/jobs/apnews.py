import requests
from bs4 import BeautifulSoup
import time
from pymongo import MongoClient
from dotenv import dotenv_values
from datetime import datetime

base_url = "https://apnews.com"
nba_news_url = base_url + "/hub/nba"


def get_url(url, sleep=1):
    time.sleep(sleep)
    return requests.get(url)


def parse_top_news(response):
    news = []
    # If the GET request is successful, the status code will be 200
    if response.status_code == 200:
        # Get the content of the response
        webpage = response.content
        # Create a BeautifulSoup object and specify the parser
        soup = BeautifulSoup(webpage, "html.parser")
        # Find all the articles on the page
        articles = soup.find_all("div", {"class": "PagePromo"})
        # For each article, find the headline and the link
        for article in articles:
            title = article.find("h3").text
            timestamp = article.find("bsp-timestamp")["data-timestamp"]
            link = article.find("a")["href"]
            image = article.find("img")

            # Trim title whitespaces
            title = title.strip()

            # Convert timestamp to datetime
            date = datetime.fromtimestamp(int(timestamp) / 1000)

            news.append({"title": title, "date": date,
                        "link": link, "imageUrl": image["src"] if image else None})
    return news


def parse_article(response):
    # If the GET request is successful, the status code will be 200
    if response.status_code == 200:
        # Get the content of the response
        webpage = response.content
        # Create a BeautifulSoup object and specify the parser
        soup = BeautifulSoup(webpage, "html.parser")
        # Parse the article title and body
        title = soup.find("h1").text
        body = soup.find("div", {"class": "RichTextStoryBody"})
        # Return title and body
        return title, body.text


def get_top_articles(news, n=5):
    _news = []
    for headline, url in news[:n]:
        article = get_url(url)
        _news.append(parse_article(article))
    return _news


def scrape_top_news():
    # Send a GET request to the website
    top_news = get_url(nba_news_url, sleep=0)
    return get_top_articles(parse_top_news(top_news))


def main():
    config = dotenv_values(".env")
    mongodb_client = MongoClient(config["MONGO_URI"])
    db = mongodb_client["2024-25"]

    news = parse_top_news(get_url(nba_news_url))

    last_game = db["games"].find_one(sort=[("GAME_DATE", -1)])
    last_game_date = last_game["GAME_DATE"]

    # Filter news to only include articles published after the last game
    news = [article for article in news if article["date"]
            > datetime.strptime(last_game_date, "%Y-%m-%d")]

    # Store the news in the database
    db["latestNews"].delete_many({})
    db["latestNews"].insert_many(news)


main()
