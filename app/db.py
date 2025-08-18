import sqlite3
import datetime

import click
from flask import current_app, g


SCHEMA = 'schema.sql'


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_db():
    db = get_db()

    with current_app.open_resource(SCHEMA) as f:
        db.executescript(f.read().decode('utf8'))


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def insert_in_db(query, args=()):
    cur = get_db().cursor().execute(query, args)
    get_db().commit()
    cur.close()
    return cur.lastrowid


@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    # id 1 on painallukset yhteensä
    insert_in_db('INSERT INTO clicks (id, n) VALUES (1, 0)')
    click.echo('Initialized the database.')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


sqlite3.register_converter(
    "timestamp", lambda v: datetime.fromisoformat(v.decode())
)
