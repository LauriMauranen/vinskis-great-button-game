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
    return render_template('index.html')


@app.route("/clicks/", methods=['POST'])
def clicks():
    n = request.form['n']

    if int(n) < 500: 
        last_id = db.insert_in_db('INSERT into clicks (n) VALUES (?)', [n])
        print(f'added row to clicks, id: {last_id}, n: {n}')
    else:
        print(f'n too big ({n})')
    
    big_n = db.update_big_n(n)

    print(f'{big_n} button presses overall')

    return 'OK'


@app.route("/clicks/stats/")
def clicks_stats():
    n = request.form['n']

    if int(n) < 500: 
        last_id = db.insert_in_db('INSERT into clicks (n) VALUES (?)', [n])
        print(f'added row to clicks, id: {last_id}, n: {n}')
    else:
        print(f'n too big ({n})')
    
    big_n = db.update_big_n(n)

    print(f'{big_n} button presses overall')

    return 'OK'
