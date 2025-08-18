from flask import Flask, render_template
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
def hello_world():
    return render_template('index.html')
