import os
from flask import Flask, render_template, request
from dotenv import load_dotenv

from . import db

load_dotenv()

app = Flask(__name__)

app.config.from_mapping(
    SECRET_KEY=os.environ['SECRET_KEY'],
    DATABASE=os.environ['DATABASE'],
)

db.init_app(app)


@app.route("/")
def home():
    big_n = db.query_big_n()
    return render_template('index.html', big_n=big_n)


@app.route("/clicks/", methods=['POST'])
def clicks():
    n = request.form['n']

    if int(n) < 200: 
        last_id = db.insert_in_db('INSERT into clicks (n) VALUES (?)', [n])
        print(f'added row with id {last_id}')

    big_n = db.update_big_n(n)

    return { 'bigN': big_n } 
