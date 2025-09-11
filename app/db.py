import sqlite3
from datetime import datetime

import click
from flask import current_app, g


SCHEMA = 'schema.sql'


def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)}


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = dict_factory

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
    cur = get_db().cursor().execute(query, args)

    if one: return cur.fetchone()

    rv = cur.fetchall()
    cur.close()

    return rv


def insert_in_db(query, args=()):
    cur = get_db().cursor().execute(query, args)
    get_db().commit()
    last_id = cur.lastrowid
    cur.close()
    return last_id


def update_in_db(query, args=()):
    cur = get_db().cursor().execute(query, args)
    get_db().commit()
    cur.close()


def update_big_n(n):
    update_in_db('UPDATE clicks SET n = n + ? WHERE id = 1', [n])
    return query_big_n()


def query_big_n():
    return query_db('SELECT n FROM clicks WHERE id = 1', one=True)['n']


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
